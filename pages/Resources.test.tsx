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
