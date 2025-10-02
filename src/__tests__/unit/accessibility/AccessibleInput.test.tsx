import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils/test-utils';
import { AccessibleInput } from '@/components/accessibility/AccessibleInput';
import userEvent from '@testing-library/user-event';

describe('AccessibleInput', () => {
  it('renders with label', () => {
    render(<AccessibleInput label="Username" />);
    
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('associates label with input using htmlFor', () => {
    render(<AccessibleInput label="Email" type="email" />);
    
    const input = screen.getByLabelText('Email');
    const label = screen.getByText('Email');
    
    expect(input).toHaveAttribute('id');
    expect(label).toHaveAttribute('for', input.id);
  });

  it('displays required indicator', () => {
    render(<AccessibleInput label="Password" required />);
    
    expect(screen.getByLabelText('Password')).toBeRequired();
    expect(screen.getByLabelText('required')).toBeInTheDocument();
  });

  it('displays error message with proper ARIA', () => {
    const error = 'This field is required';
    render(<AccessibleInput label="Username" error={error} />);
    
    const input = screen.getByLabelText('Username');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent(error);
  });

  it('displays helper text', () => {
    render(<AccessibleInput label="Username" helperText="Enter your username" />);
    
    expect(screen.getByText('Enter your username')).toBeInTheDocument();
  });

  it('hides label visually when hideLabel is true', () => {
    render(<AccessibleInput label="Search" hideLabel />);
    
    const label = screen.getByText('Search');
    expect(label).toHaveClass('sr-only');
  });

  it('uses aria-describedby for error and helper text', () => {
    render(
      <AccessibleInput 
        label="Email" 
        error="Invalid email" 
        helperText="We'll never share your email"
      />
    );
    
    const input = screen.getByLabelText('Email');
    const describedBy = input.getAttribute('aria-describedby');
    
    expect(describedBy).toBeTruthy();
    expect(describedBy).toContain('error');
  });

  it('handles user input correctly', async () => {
    const user = userEvent.setup();
    render(<AccessibleInput label="Name" />);
    
    const input = screen.getByLabelText('Name');
    await user.type(input, 'John Doe');
    
    expect(input).toHaveValue('John Doe');
  });

  it('applies custom className', () => {
    render(<AccessibleInput label="Test" className="custom-class" />);
    
    const input = screen.getByLabelText('Test');
    expect(input).toHaveClass('custom-class');
  });

  it('shows error instead of helper text when both provided', () => {
    render(
      <AccessibleInput 
        label="Field" 
        error="Error message" 
        helperText="Helper message"
      />
    );
    
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Helper message')).not.toBeInTheDocument();
  });
});
