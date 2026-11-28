import React from 'react';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, type InitialEntry } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Contact from './Contact';
import { ApiError } from '../utils/api';

const mocks = vi.hoisted(() => ({
  addToast: vi.fn(),
  clearDraft: vi.fn(),
  loadDraft: vi.fn(),
  post: vi.fn(),
}));

vi.mock('../components/SEO', () => ({
  default: () => null,
}));

vi.mock('../utils/api', async () => {
  const actual = await vi.importActual<typeof import('../utils/api')>('../utils/api');
  return {
    ...actual,
    apiClient: {
      ...actual.apiClient,
      post: mocks.post,
    },
  };
});

vi.mock('../hooks', async () => {
  const actual = await vi.importActual<typeof import('../hooks')>('../hooks');
  return {
    ...actual,
    useToast: () => ({ addToast: mocks.addToast }),
    useFormDraft: () => ({
      loadDraft: mocks.loadDraft,
      clearDraft: mocks.clearDraft,
      lastSaved: null,
    }),
  };
});

const renderContact = (initialEntry: InitialEntry = '/contact') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Contact />
    </MemoryRouter>,
  );

const sendButton = () => screen.getByRole('button', { name: /^send message/i });

const fillRequiredFields = () => {
  fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: 'Alice O’Brien' } });
  fireEvent.change(screen.getByLabelText(/^mobile number/i), { target: { value: '9482359455' } });
  fireEvent.change(screen.getByLabelText(/^email/i), { target: { value: 'alice@example.com' } });
  fireEvent.change(screen.getByLabelText(/^message/i), { target: { value: 'Please call me back.' } });
};

describe('Contact', () => {
  beforeEach(() => {
    localStorage.clear();
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    Element.prototype.scrollIntoView = vi.fn();
    mocks.addToast.mockClear();
    mocks.clearDraft.mockClear();
    mocks.loadDraft.mockReturnValue(null);
    mocks.post.mockReset();
    window.history.replaceState(null, '', '/');
  });

  it('shows validation errors when submitting an empty form', async () => {
    renderContact();

    fireEvent.click(sendButton());

    expect(await screen.findByText('Please enter your name.')).toBeInTheDocument();
    // Audit NOV-12: one way to reply is enough, so the two fields share one message.
    expect(screen.getAllByText('Please enter a mobile number or an email address, so that we can reply.')).toHaveLength(
      2,
    );
    expect(screen.getByText('Please write a short message.')).toBeInTheDocument();
    expect(screen.getByLabelText(/^name/i)).toHaveAttribute('aria-invalid', 'true');
    expect(mocks.addToast).toHaveBeenCalledWith('Please check the highlighted fields.', 'error');
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it('sends with a mobile number and no email, and with an email and no mobile number (Audit NOV-12)', async () => {
    mocks.post.mockResolvedValue({});
    const first = renderContact();

    fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: 'Ramesh' } });
    fireEvent.change(screen.getByLabelText(/^mobile number/i), { target: { value: '9482359455' } });
    fireEvent.change(screen.getByLabelText(/^message/i), { target: { value: 'Please call me back.' } });
    fireEvent.click(sendButton());

    await waitFor(() => expect(mocks.post).toHaveBeenCalledTimes(1));
    const [, byPhone] = mocks.post.mock.calls[0]!;
    expect(byPhone).toMatchObject({ name: 'Ramesh', phone: '9482359455' });
    expect(byPhone).not.toHaveProperty('email');
    first.unmount();

    mocks.post.mockClear();
    renderContact();
    fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: 'Asha' } });
    fireEvent.change(screen.getByLabelText(/^email/i), { target: { value: 'asha@example.com' } });
    fireEvent.change(screen.getByLabelText(/^message/i), { target: { value: 'Please write to me.' } });
    fireEvent.click(sendButton());

    await waitFor(() => expect(mocks.post).toHaveBeenCalledTimes(1));
    const [, byEmail] = mocks.post.mock.calls[0]!;
    expect(byEmail).toMatchObject({ name: 'Asha', email: 'asha@example.com' });
    expect(byEmail).not.toHaveProperty('phone');
  });

  it('clears "one of these, please" on both fields once either is filled in (Audit NOV-12)', async () => {
    renderContact();
    const either = 'Please enter a mobile number or an email address, so that we can reply.';

    fireEvent.click(sendButton());
    expect(await screen.findAllByText(either)).toHaveLength(2);

    fireEvent.change(screen.getByLabelText(/^email/i), { target: { value: 'asha@example.com' } });
    await waitFor(() => expect(screen.queryByText(either)).not.toBeInTheDocument());
    expect(screen.getByLabelText(/^mobile number/i)).not.toHaveAttribute('aria-invalid');
  });

  it('checks a field when it is left', async () => {
    renderContact();

    const emailInput = screen.getByLabelText(/^email/i);
    fireEvent.change(emailInput, { target: { value: 'alice@' } });
    fireEvent.blur(emailInput);

    expect(await screen.findByText('This email address looks incomplete. Please check it.')).toBeInTheDocument();
  });

  it('takes a number from abroad when it has the country code', async () => {
    renderContact();

    const phoneInput = screen.getByLabelText(/^mobile number/i);
    fireEvent.change(phoneInput, { target: { value: '4155550123' } });
    fireEvent.blur(phoneInput);
    const message = 'Please enter a 10-digit mobile number. From abroad, start with + and the country code.';
    expect(await screen.findByText(message)).toBeInTheDocument();

    fireEvent.change(phoneInput, { target: { value: '+1 415 555 0123' } });
    fireEvent.blur(phoneInput);
    await waitFor(() => expect(screen.queryByText(message)).not.toBeInTheDocument());
    expect(phoneInput).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('leaves every box empty, with no placeholder text', () => {
    const { container } = renderContact();

    expect(container.querySelectorAll('.fld [placeholder]')).toHaveLength(0);
  });

  it('keeps the honeypot out of view, where browsers will not autofill it', () => {
    const { container } = renderContact();
    const honeypot = container.querySelector('input[name="_honey"]') as HTMLInputElement;

    expect(honeypot).not.toBeVisible();
    expect(honeypot.closest('[hidden]')).not.toBeNull();
  });

  it('does not send when the honeypot is filled, and says how else to reach us', () => {
    const { container } = renderContact();
    const honeypot = container.querySelector('input[name="_honey"]') as HTMLInputElement;

    fireEvent.change(honeypot, { target: { value: 'bot-value' } });
    fillRequiredFields();
    fireEvent.click(sendButton());

    expect(mocks.post).not.toHaveBeenCalled();
    expect(mocks.addToast).toHaveBeenCalledWith(expect.stringContaining('email us directly'), 'error');
  });

  it('preselects a valid query string subject and ignores an invalid one', () => {
    const { container, unmount } = renderContact('/contact?subject=GST');

    const chosen = container.querySelector<HTMLInputElement>('input[name="subject"][value="GST"]');
    expect(chosen).toBeChecked();
    unmount();

    const second = renderContact('/contact?subject=%3Cscript%3Ealert(1)%3C%2Fscript%3E');
    expect(second.container.querySelector('input[name="subject"]:checked')).toBeNull();
  });

  it('preselects the subject that covers the service a visitor came from', () => {
    const { container } = renderContact('/contact?subject=nri-taxation');

    expect(container.querySelector('input[name="subject"][value="Income tax"]')).toBeChecked();
  });
  it('asks what the enquiry is about when "Something else" is chosen', async () => {
    renderContact();

    fillRequiredFields();
    fireEvent.click(screen.getByRole('radio', { name: 'Something else' }));
    fireEvent.click(sendButton());

    expect(await screen.findByText('Please tell us what it is about.')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /what is it about/i })).toBeInTheDocument();
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it('puts a question carried over from the FAQ page into the message', () => {
    renderContact({ pathname: '/contact', hash: '#write', state: { faqQuestion: 'tds on rent' } });

    expect(screen.getByLabelText(/^message/i)).toHaveValue('I could not find this in your FAQs: tds on rent\n\n');
  });

  it('clears the draft and resets the form after a successful submit', async () => {
    mocks.post.mockResolvedValue({});
    renderContact();

    fillRequiredFields();
    fireEvent.click(sendButton());

    await waitFor(() => expect(mocks.post).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mocks.clearDraft).toHaveBeenCalledTimes(1));
    expect(await screen.findByRole('heading', { name: 'Thank you, Alice.' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /send another message/i }));
    expect(screen.getByLabelText(/^name/i)).toHaveValue('');
  });

  it('reports a message FormSubmit refused instead of thanking the sender', async () => {
    mocks.post.mockResolvedValue({ success: 'false', message: 'This form needs Activation.' });
    renderContact();

    fillRequiredFields();
    fireEvent.click(sendButton());

    await waitFor(() => {
      expect(mocks.addToast).toHaveBeenCalledWith(expect.stringMatching(/We could not send your message/), 'error');
    });
    expect(screen.queryByRole('heading', { name: /thank you/i })).not.toBeInTheDocument();
    expect(mocks.clearDraft).not.toHaveBeenCalled();
  });

  it('offers the phone, WhatsApp and email when the sending service fails, and claims nothing else (Audit NOV-01)', async () => {
    mocks.post.mockRejectedValue(new ApiError('', 500, 'SERVER_ERROR'));
    renderContact();

    fillRequiredFields();
    fireEvent.click(sendButton());

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/We could not send your message just now/);
    expect(within(alert).getByRole('link', { name: '+91 94823 59455' })).toHaveAttribute('href', 'tel:+919482359455');
    expect(within(alert).getByRole('link', { name: /WhatsApp/ })).toHaveAttribute('target', '_blank');
    expect(within(alert).getByRole('link', { name: 'mail@casagar.co.in' })).toHaveAttribute(
      'href',
      'mailto:mail@casagar.co.in',
    );
    // What was typed is kept, and no wording invents a notification or shows a status code.
    expect(screen.getByLabelText(/^message/i)).toHaveValue('Please call me back.');
    const said = `${document.body.textContent} ${mocks.addToast.mock.calls.map(([text]) => String(text)).join(' ')}`;
    expect(said).not.toMatch(/notified/i);
    expect(said).not.toMatch(/\(\d{3}\)/);
    expect(mocks.clearDraft).not.toHaveBeenCalled();
  });

  it('asks the visitor to check the connection, with no other-ways message, when the network fails', async () => {
    mocks.post.mockRejectedValue(new ApiError('Connection failed. Please check your internet.', 0, 'NETWORK_ERROR'));
    renderContact();

    fillRequiredFields();
    fireEvent.click(sendButton());

    await waitFor(() => {
      expect(mocks.addToast).toHaveBeenCalledWith(expect.stringMatching(/check your connection/), 'error');
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('blocks after three attempts and shows the wait message', async () => {
    localStorage.setItem('contact_form_limit', JSON.stringify([Date.now(), Date.now(), Date.now()]));
    const { container } = renderContact();

    await waitFor(() => expect(sendButton()).toBeDisabled());
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    await waitFor(() => {
      expect(mocks.addToast).toHaveBeenCalledWith(expect.stringMatching(/Please wait \d+s before retrying\./), 'error');
    });
  });
});
