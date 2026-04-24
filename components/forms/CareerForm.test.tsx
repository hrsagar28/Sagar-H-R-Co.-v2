import React from 'react';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CareerForm from './CareerForm';

const mocks = vi.hoisted(() => ({
  addToast: vi.fn(),
  announce: vi.fn(),
  clearDraft: vi.fn(),
  loadDraft: vi.fn(),
  post: vi.fn()
}));

let draftLastSaved: Date | null = null;

vi.mock('./CustomDropdown', () => ({
  default: ({
    label,
    name,
    value,
    options,
    onChange
  }: {
    label: string;
    name: string;
    value: string;
    options: string[];
    onChange: (name: string, value: string) => void;
  }) => (
    <label>
      {label}
      <select aria-label={label} value={value} onChange={(event) => onChange(name, event.target.value)}>
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}));

vi.mock('./CustomDatePicker', () => ({
  default: ({
    label,
    name,
    value,
    onChange
  }: {
    label: string;
    name: string;
    value: string;
    onChange: (name: string, value: string) => void;
  }) => (
    <label>
      {label}
      <input aria-label={label} type="date" value={value} onChange={(event) => onChange(name, event.target.value)} />
    </label>
  )
}));

vi.mock('../../utils/api', async () => {
  const actual = await vi.importActual<typeof import('../../utils/api')>('../../utils/api');
  return {
    ...actual,
    apiClient: {
      ...actual.apiClient,
      post: mocks.post
    }
  };
});

vi.mock('../../hooks', async () => {
  const actual = await vi.importActual<typeof import('../../hooks')>('../../hooks');
  return {
    ...actual,
    useToast: () => ({ addToast: mocks.addToast }),
    useAnnounce: () => ({ announce: mocks.announce }),
    useFormDraft: () => ({
      hasDraft: Boolean(draftLastSaved),
      loadDraft: mocks.loadDraft,
      clearDraft: mocks.clearDraft,
      lastSaved: draftLastSaved
    }),
    useReducedMotion: () => false
  };
});

const renderCareerForm = (props: React.ComponentProps<typeof CareerForm> = {}) => render(<CareerForm {...props} />);

const completeWizard = async () => {
  fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Alice OBrien' } });
  fireEvent.change(screen.getByLabelText(/father's name/i), { target: { value: 'Raman OBrien' } });
  fireEvent.change(screen.getByLabelText(/date of birth/i), { target: { value: '1998-04-24' } });
  fireEvent.click(screen.getByRole('button', { name: /next step/i }));
  await screen.findByLabelText(/mobile number/i);

  fireEvent.change(screen.getByLabelText(/mobile number/i), { target: { value: '9482359455' } });
  fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'alice@example.com' } });
  fireEvent.click(screen.getByRole('button', { name: /next step/i }));
  await screen.findByLabelText(/years of experience/i);

  fireEvent.change(screen.getByLabelText(/qualification/i), { target: { value: 'B.Com' } });
  fireEvent.change(screen.getByLabelText(/years of experience/i), { target: { value: '1-2 Years' } });
  fireEvent.click(screen.getByRole('button', { name: /review application/i }));

  await screen.findByRole('button', { name: /submit application/i });
};

describe('CareerForm', () => {
  beforeEach(() => {
    localStorage.clear();
    draftLastSaved = null;
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
    mocks.announce.mockClear();
    mocks.clearDraft.mockClear();
    mocks.loadDraft.mockReset();
    mocks.loadDraft.mockReturnValue(null);
    mocks.post.mockReset();
  });

  it('prevents advancing when required step 1 fields are missing', async () => {
    renderCareerForm();

    fireEvent.click(screen.getByRole('button', { name: /next step/i }));

    expect(await screen.findByText('Full Name is required')).toBeInTheDocument();
    expect(screen.queryByLabelText(/mobile number/i)).not.toBeInTheDocument();
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it('silently blocks submission when the honeypot is filled', async () => {
    const { container } = renderCareerForm({ initialPosition: 'Audit Associate' });

    await completeWizard();
    fireEvent.change(container.querySelector('input[name="_hp_wauth_do_not_fill"]') as HTMLInputElement, {
      target: { value: 'bot-value' }
    });
    fireEvent.click(screen.getByRole('button', { name: /submit application/i }));

    expect(mocks.post).not.toHaveBeenCalled();
    expect(mocks.addToast).not.toHaveBeenCalled();
  });

  it('restores a saved draft when the user resumes', async () => {
    draftLastSaved = new Date('2026-04-24T10:00:00+05:30');
    mocks.loadDraft.mockReturnValue({
      fullName: 'Draft Candidate',
      fatherName: 'Draft Parent',
      mobile: '9482359455',
      email: 'draft@example.com',
      dob: '1997-03-12',
      qualification: 'M.Com',
      experience: '1-2 Years',
      previousCompanies: 'Previous Co',
      whyJoin: 'To grow with the firm.',
      position: 'Audit Associate'
    });

    renderCareerForm();
    fireEvent.click(await screen.findByRole('button', { name: /resume/i }));

    expect(screen.getByLabelText(/full name/i)).toHaveValue('Draft Candidate');
    expect(mocks.addToast).toHaveBeenCalledWith('Application draft restored.', 'success');
  });

  it('clears the draft and shows success after a successful submit', async () => {
    mocks.post.mockResolvedValue({});
    renderCareerForm({ initialPosition: 'Audit Associate' });

    await completeWizard();
    fireEvent.click(screen.getByRole('button', { name: /submit application/i }));

    await waitFor(() => expect(mocks.post).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mocks.clearDraft).toHaveBeenCalledTimes(1));
    expect(await screen.findByText('Application Submitted!')).toBeInTheDocument();
  });

  it('blocks submission after three recent attempts', async () => {
    const now = Date.now();
    localStorage.setItem('career_submission_limit', JSON.stringify([now, now, now]));
    const { container } = renderCareerForm({ initialPosition: 'Audit Associate' });

    await completeWizard();
    expect(screen.getByRole('button', { name: /submit application/i })).toBeDisabled();
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    await waitFor(() => {
      expect(mocks.addToast).toHaveBeenCalledWith(expect.stringMatching(/Still submitting - please wait \d+ seconds\./), 'info');
    });
    expect(mocks.post).not.toHaveBeenCalled();
  });
});
