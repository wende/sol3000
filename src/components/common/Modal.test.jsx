import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { Modal } from './Modal';

describe('Modal', () => {
  it('renders in a portal to avoid transformed ancestor layout issues', () => {
    const { container, unmount } = render(() => (
      <div style={{ transform: 'translateY(0px)' }}>
        <Modal open={true} onClose={vi.fn()} title="TEST">
          Content
        </Modal>
      </div>
    ));

    const dialog = screen.getByRole('dialog');

    expect(document.body).toContainElement(dialog);
    expect(container).not.toContainElement(dialog);

    unmount();
  });
});

