import React from 'react';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import * as matchers from 'vitest-axe/matchers';
import { CHECKLISTS, RESOURCE_GROUPS, RESOURCE_TOOLS } from '../constants/resources';
import Resources from './Resources';
import ResourceTool from './ResourceTool';
import ChecklistDetail from './ChecklistDetail';

expect.extend(matchers);

vi.mock('../components/SEO', () => ({
  default: () => null,
}));

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <main>
        <Routes>
          <Route path="/resources" element={<Resources />} />
          <Route path="/resources/checklist/:slug" element={<ChecklistDetail />} />
          <Route path="/resources/:tool" element={<ResourceTool />} />
        </Routes>
      </main>
    </MemoryRouter>,
  );

describe('Resources', () => {
  it('lists every tool in its group and every checklist', () => {
    renderAt('/resources');

    expect(screen.getByRole('heading', { level: 1, name: 'Resources' })).toBeInTheDocument();
    RESOURCE_GROUPS.forEach((group) => {
      const section = screen.getByRole('region', { name: group.name });
      const tools = RESOURCE_TOOLS.filter((tool) => tool.group === group.id);
      const links = within(section).getAllByRole('link');
      expect(links.map((link) => link.getAttribute('href'))).toEqual(tools.map((tool) => `/resources/${tool.slug}`));
    });
    const checklists = within(screen.getByRole('region', { name: 'Checklists' })).getAllByRole('link');
    expect(checklists).toHaveLength(CHECKLISTS.length);
  });

  it('opens government portals in a new tab', () => {
    renderAt('/resources');

    const links = within(screen.getByRole('region', { name: 'Government portals' })).getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link.getAttribute('href')).toMatch(/^https:\/\//);
    });
  });

  it('renders the index with no axe violations', async () => {
    const { container } = renderAt('/resources');
    expect(await axe(container)).toHaveNoViolations();
  });

  it.each(RESOURCE_TOOLS.map((tool) => [tool.slug, tool.name]))(
    'renders /resources/%s with no axe violations',
    async (slug, name) => {
      const { container } = renderAt(`/resources/${slug}`);
      expect(await screen.findByRole('heading', { level: 1, name })).toBeInTheDocument();
      expect(await axe(container)).toHaveNoViolations();
    },
  );

  it('works out GST as you type', async () => {
    renderAt('/resources/gst-calculator');

    const amount = await screen.findByLabelText('Amount');
    fireEvent.focus(amount);
    fireEvent.change(amount, { target: { value: '1000' } });
    const result = screen.getByText('Total GST').closest('dl')!;
    expect(result).toHaveTextContent('CGST at 9%₹90.00');
    expect(result).toHaveTextContent('Price including GST₹1,180.00');

    fireEvent.click(screen.getByLabelText('In another state, or an SEZ unit'));
    expect(result).toHaveTextContent('IGST at 18%₹180.00');
    // The figures entered are listed for printing.
    expect(screen.getByText('The figures entered')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Print this estimate' })).toBeInTheDocument();
  });

  it('shows a property loss as a loss, and offers improvement years only from the purchase', async () => {
    renderAt('/resources/capital-gains-calculator');

    fireEvent.change(await screen.findByLabelText('Date bought'), { target: { value: '2012-06-15' } });
    fireEvent.change(screen.getByLabelText('Date sold'), { target: { value: '2025-09-10' } });
    for (const [label, value] of [
      ['Price paid', '9000000'],
      ['Sale price', '7000000'],
    ]) {
      const input = screen.getByLabelText(label!);
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value } });
    }
    expect(screen.getByText('Long-term loss')).toBeInTheDocument();
    expect(screen.getByText('Loss without indexation').nextSibling).toHaveTextContent('₹20,00,000');
    expect(screen.queryByText(/₹-/)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Add an improvement' }));
    const years = within(screen.getByLabelText('Year paid (improvement 1)')).getAllByRole('option');
    expect(years[0]).toHaveTextContent('2012-13');
    expect(years.at(-1)).toHaveTextContent('2025-26');
  });

  it('finds the new section or form for an old one', async () => {
    renderAt('/resources/section-finder');

    const search = await screen.findByLabelText('Search the sections and forms');
    fireEvent.change(search, { target: { value: '80C' } });
    expect(
      screen.getByText('PF, PPF, life insurance, ELSS, tuition fees and pension plans').closest('li'),
    ).toHaveTextContent('123');
    fireEvent.change(search, { target: { value: 'form 26AS' } });
    expect(screen.getByText('Annual tax statement').closest('li')).toHaveTextContent('168');
    fireEvent.change(search, { target: { value: 'Schedule III' } });
    expect(screen.getByText('House rent allowance').closest('li')).toHaveTextContent('Sl. No. 11');
    // Moved by the Finance Act, 2026: s.446 no longer covers the audit default.
    fireEvent.change(search, { target: { value: '271B' } });
    expect(screen.getByText('Not getting accounts audited, now a fee').closest('li')).toHaveTextContent('428');
    fireEvent.change(search, { target: { value: 'nothing like this' } });
    expect(screen.getByRole('heading', { name: /Nothing matches/ })).toBeInTheDocument();
  });

  it('searches the index', () => {
    renderAt('/resources');

    fireEvent.change(screen.getByLabelText('Search the resources'), { target: { value: 'NRI' } });
    expect(screen.getByRole('link', { name: /Non-resident Indians/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /HRA calculator/ })).toBeNull();
  });

  it('opens the due dates on this month and next', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-06T10:00:00+05:30'));
    try {
      renderAt('/resources/due-dates');
      expect(await screen.findByRole('heading', { level: 2, name: 'October 2026' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'November 2026' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { level: 2, name: 'December 2026' })).toBeNull();
      fireEvent.click(screen.getByRole('button', { name: 'Show the rest of the year' }));
      expect(screen.getByRole('heading', { level: 2, name: 'March 2027' })).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('invites no work on the tool pages', async () => {
    for (const tool of RESOURCE_TOOLS) {
      const { unmount } = renderAt(`/resources/${tool.slug}`);
      await screen.findByRole('heading', { level: 1, name: tool.name });
      expect(screen.queryByText(/ask us|send us your|we will work/i)).toBeNull();
      unmount();
    }
  });

  it('says so for a tool that does not exist', () => {
    renderAt('/resources/no-such-tool');
    expect(screen.getByRole('heading', { level: 1, name: 'Tool not found' })).toBeInTheDocument();
  });

  it.each(CHECKLISTS.map((checklist) => [checklist.slug, checklist.title]))(
    'renders the %s checklist with no axe violations',
    async (slug, title) => {
      const { container } = renderAt(`/resources/checklist/${slug}`);
      expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
      expect(await axe(container)).toHaveNoViolations();
    },
  );

  it('never asks for a password', () => {
    const text = JSON.stringify(CHECKLISTS);
    expect(text).not.toMatch(/password/i);
  });
});
