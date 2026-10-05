import React from 'react';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import * as matchers from 'vitest-axe/matchers';
import { OPEN_ROLES } from '../constants/careers';
import Careers from './Careers';

expect.extend(matchers);

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
  return { ...actual, apiClient: { ...actual.apiClient, post: mocks.post } };
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

// Before the roles' closing date, and after it.
const WHILE_OPEN = new Date('2026-10-10T10:00:00+05:30');
const AFTER_CLOSING = new Date('2027-01-15T10:00:00+05:30');

const renderCareers = (now: Date) => {
  vi.setSystemTime(now);
  return render(
    <MemoryRouter initialEntries={['/careers']}>
      <main>
        <Careers />
      </main>
    </MemoryRouter>,
  );
};

const form = () => screen.getByRole('form', { name: 'Apply' });

const fillForm = () => {
  const f = within(form());
  fireEvent.change(f.getByLabelText(/^full name/i), { target: { value: 'Priya Raman' } });
  fireEvent.change(f.getByLabelText(/^father’s name/i), { target: { value: 'K Raman' } });
  fireEvent.change(f.getByLabelText(/^date of birth/i), { target: { value: '2003-05-14' } });
  fireEvent.change(f.getByLabelText(/^mobile number/i), { target: { value: '9845012345' } });
  fireEvent.change(f.getByLabelText(/^email/i), { target: { value: 'priya@example.com' } });
  fireEvent.change(f.getByLabelText(/^qualification/i), { target: { value: 'B.Com' } });
  fireEvent.click(f.getByLabelText('Fresher'));
};

describe('Careers', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
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
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('lists the open roles with their duties showing', () => {
    renderCareers(WHILE_OPEN);

    OPEN_ROLES.forEach((role) => {
      const toggle = screen.getByRole('button', { name: new RegExp(`^${role.role}`) });
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText(role.responsibilities[0]!)).toBeInTheDocument();
    });
  });

  it('chooses the role on the form from "Apply for this role"', () => {
    renderCareers(WHILE_OPEN);

    fireEvent.click(screen.getAllByRole('button', { name: /apply for this role/i })[1]!);

    expect(within(form()).getByLabelText(OPEN_ROLES[1]!.role)).toBeChecked();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it('flags every missing field, including the role', async () => {
    renderCareers(WHILE_OPEN);

    fireEvent.click(screen.getByRole('button', { name: /send application/i }));

    expect(await screen.findByText('Please choose the role you’re applying for.')).toBeInTheDocument();
    expect(screen.getByText('Please enter your full name.')).toBeInTheDocument();
    expect(screen.getByText('Please choose your experience.')).toBeInTheDocument();
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it('sends the application and thanks the applicant', async () => {
    mocks.post.mockResolvedValue({ success: 'true' });
    renderCareers(WHILE_OPEN);

    fireEvent.click(within(form()).getByLabelText('Audit Associate'));
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /send application/i }));

    await waitFor(() => expect(mocks.post).toHaveBeenCalledTimes(1));
    const [, payload] = mocks.post.mock.calls[0]!;
    expect(payload).toMatchObject({
      position: 'Audit Associate',
      fullName: 'Priya Raman',
      experience: 'Fresher',
      _subject: 'Job Application: Priya Raman - Audit Associate',
    });
    expect(await screen.findByRole('heading', { name: 'Thank you, Priya.' })).toBeInTheDocument();
    expect(mocks.clearDraft).toHaveBeenCalled();
  });

  it('does not send when the honeypot is filled, and says how else to reach us', () => {
    const { container } = renderCareers(WHILE_OPEN);

    fireEvent.change(container.querySelector('input[name="_honey"]') as HTMLInputElement, {
      target: { value: 'bot-value' },
    });
    fireEvent.click(within(form()).getByLabelText('Audit Associate'));
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /send application/i }));

    expect(mocks.post).not.toHaveBeenCalled();
    expect(mocks.addToast).toHaveBeenCalledWith(expect.stringContaining('email us'), 'error');
  });

  it('says no roles are open once the closing date has passed, and still takes applications', () => {
    renderCareers(AFTER_CLOSING);

    expect(screen.getByRole('heading', { name: 'No roles are open right now' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /apply for this role/i })).toBeNull();
    const roleChoices = within(form()).getAllByRole('radio', { name: /role|associate|assistant/i });
    expect(roleChoices).toHaveLength(1);
    expect(within(form()).getByLabelText('Any suitable role')).toBeChecked();
  });

  it('renders no axe violations', async () => {
    const { container } = renderCareers(WHILE_OPEN);

    expect(await axe(container)).toHaveNoViolations();
  });
});
