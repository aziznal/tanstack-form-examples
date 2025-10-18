import { z } from 'zod';
import { revalidateLogic, useForm } from '@tanstack/react-form';
import type { AnyFieldApi } from '@tanstack/react-form';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FormContainer } from '@/components/form-container';

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8, 'Password must have 8+ characters'),
  confirmPassword: z.string(),
});

type LoginForm = z.input<typeof loginSchema>;

export const LoginFormExample: React.FC<{ className?: string }> = (props) => {
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    } satisfies LoginForm,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: loginSchema,
    },
  });

  return (
    <FormContainer>
      <form
        className={cn('space-y-2', props.className)}
        onSubmit={(e) => {
          e.stopPropagation();
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <form.Field
          name="email"
          children={(field) => <FieldInput field={field} />}
        />

        <form.Field
          name="password"
          children={(field) => <FieldInput field={field} />}
        />

        <form.Field
          name="confirmPassword"
          validators={{
            onChangeListenTo: ['password'],
            onBlur: ({ value, fieldApi }) => {
              if (value !== fieldApi.form.getFieldValue('password')) {
                return 'Passwords do not match';
              }
              return undefined;
            },
          }}
          children={(field) => <FieldInput field={field} />}
        />

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? '...' : 'Submit'}
            </Button>
          )}
        />

        <form.Subscribe
          children={() => (
            <div className="mt-6">
              <h1>Form values</h1>

              <div>Email: {form.state.values.email}</div>
              <div>Password: {form.state.values.password}</div>
            </div>
          )}
        />
      </form>
    </FormContainer>
  );
};

function FieldInput({ field }: { field: AnyFieldApi }) {
  return (
    <div className="space-y-2">
      <Label className="capitalize" htmlFor={field.name}>
        {field.name}
      </Label>

      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
      />

      <FieldErrors field={field} />
    </div>
  );
}

function FieldErrors({ field }: { field: AnyFieldApi }) {
  return (
    <div className="min-h-lh">
      <em
        className={cn(
          'text-red-800 invisible',
          field.state.meta.isTouched && !field.state.meta.isValid && 'visible',
        )}
      >
        {field.state.meta.errors.map((err) => {
          if (typeof err === 'string') {
            return <div key={err}>{err}</div>;
          }

          if ('message' in err) {
            return <div key={err}>{err.message}</div>;
          }
        })}
      </em>
    </div>
  );
}
