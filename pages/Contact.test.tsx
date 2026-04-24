import React from 'react';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Contact from './Contact';
import { SERVICES } from '../constants';

const mocks = vi.hoisted(() => ({
  addToast: vi.fn(),
  clearDraft: vi.fn(),
  loadDraft: vi.fn(),
  post: vi.fn()
}));

vi.mock('../components/SEO', () => ({
  default: () => null
}));

vi.mock('../components/Reveal', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

vi.mock('../components/hero', () => ({
  PageHero: () => <div data-testid="page-hero" />
}));

vi.mock('../utils/api', async () => {
  const actual = await vi.importActual<typeof import('../utils/api')>('../utils/api');
  return {
    ...actual,
    apiClient: {
      ...actual.apiClient,
      post: mocks.post
    }
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
      lastSaved: null
    })
  };
});

const renderContact = (initialEntry = '/contact') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Contact />
    </MemoryRouter>
  );

const fillRequiredFields = () => {
  fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: 'Alice O’Brien' } });
  fireEvent.change(screen.getByLabelText(/^phone/i), { target: { value: '9482359455' } });
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
      dispatchEvent: vi.fn()
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

    fireEvent.click(screen.getByRole('button', { name: /^send/i }));

    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Phone is required')).toBeInTheDocument();
    expect(screen.getByText('Message is required')).toBeInTheDocument();
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it('silently blocks submission when the honeypot is filled', () => {
    const { container } = renderContact();
    const honeypot = container.querySelector('input[name="_honey"]') as HTMLInputElement;

    fireEvent.change(honeypot, { target: { value: 'bot-value' } });
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /^send/i }));

    expect(mocks.post).not.toHaveBeenCalled();
    expect(mocks.addToast).not.toHaveBeenCalled();
  });

  it('preselects a valid query string subject and ignores an invalid one', () => {
    const validSubject = SERVICES[0].title;
    const { unmount } = renderContact(`/contact?subject=${encodeURIComponent(validSubject)}`);

    expect(screen.getAllByText(validSubject).length).toBeGreaterThan(0);
    unmount();

    renderContact('/contact?subject=%3Cscript%3Ealert(1)%3C%2Fscript%3E');
    expect(screen.getByText('Select a topic')).toBeInTheDocument();
  });

  it('clears the draft and resets the form after a successful submit', async () => {
    mocks.post.mockResolvedValue({});
    renderContact();

    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /^send/i }));

    await waitFor(() => expect(mocks.post).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mocks.clearDraft).toHaveBeenCalledTimes(1));
    expect(await screen.findByText('Message Sent!')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /send another message/i }));
    expect(screen.getByLabelText(/^name/i)).toHaveValue('');
  });

  it('blocks after three attempts and shows the wait message', async () => {
    localStorage.setItem('contact_form_limit', JSON.stringify([Date.now(), Date.now(), Date.now()]));
    const { container } = renderContact();

    await waitFor(() => expect(screen.getByRole('button', { name: /^send/i })).toBeDisabled());
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    await waitFor(() => {
      expect(mocks.addToast).toHaveBeenCalledWith(expect.stringMatching(/Please wait \d+s before retrying\./), 'error');
    });
  });
});
