import React from 'react';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, type InitialEntry } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Contact from './Contact';
import { SERVICES } from '../constants';

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
      hasDraft: false,
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
    expect(screen.getByText('Please enter your email address.')).toBeInTheDocument();
    expect(screen.getByText('Please enter a mobile number we can call.')).toBeInTheDocument();
    expect(screen.getByText('Please write a short message.')).toBeInTheDocument();
    expect(screen.getByLabelText(/^name/i)).toHaveAttribute('aria-invalid', 'true');
    expect(mocks.addToast).toHaveBeenCalledWith('Please check the highlighted fields.', 'error');
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it('checks a field when it is left', async () => {
    renderContact();

    const emailInput = screen.getByLabelText(/^email/i);
    fireEvent.change(emailInput, { target: { value: 'alice@' } });
    fireEvent.blur(emailInput);

    expect(await screen.findByText('This email address looks incomplete. Please check it.')).toBeInTheDocument();
  });

  it('silently blocks submission when the honeypot is filled', () => {
    const { container } = renderContact();
    const honeypot = container.querySelector('input[name="_honey"]') as HTMLInputElement;

    fireEvent.change(honeypot, { target: { value: 'bot-value' } });
    fillRequiredFields();
    fireEvent.click(sendButton());

    expect(mocks.post).not.toHaveBeenCalled();
    expect(mocks.addToast).not.toHaveBeenCalled();
  });

  it('preselects a valid query string subject and ignores an invalid one', () => {
    const validSubject = SERVICES[0]?.title || '';
    const { container, unmount } = renderContact(`/contact?subject=${encodeURIComponent(validSubject)}`);

    const chosen = container.querySelector<HTMLInputElement>(`input[name="subject"][value="${validSubject}"]`);
    expect(chosen).toBeChecked();
    unmount();

    const second = renderContact('/contact?subject=%3Cscript%3Ealert(1)%3C%2Fscript%3E');
    expect(second.container.querySelector('input[name="subject"]:checked')).toBeNull();
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
