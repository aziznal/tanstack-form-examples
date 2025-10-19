import { z } from 'zod';
import { revalidateLogic, useForm } from '@tanstack/react-form';
import type { AnyFieldApi } from '@tanstack/react-form';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormContainer } from '@/components/form-container';
import { SubmitButton } from '@/components/submit-button/submit-button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const salarySchema = z.object({
  currency: z.enum(['usd', 'eur']),
  min: z.coerce.number<number>(),
  max: z.coerce.number<number>(),
});

type SalaryForm = z.input<typeof salarySchema>;

const currencyChoices = [
  { name: '$', value: 'usd' },
  {
    name: '€',
    value: 'eur',
  },
  {
    name: '¥',
    // @ts-expect-error intentional error
    value: 'yen',
  },
] satisfies Array<{
  name: string;
  value: SalaryForm['currency'];
}>;

export const SalaryFormExample: React.FC<{ className?: string }> = (props) => {
  const form = useForm({
    defaultValues: {
      min: 0,
      max: 0,
      currency: 'usd',
    } as SalaryForm,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: salarySchema,
    },
  });

  return (
    <FormContainer>
      <h1 className="text-2xl font-bold">Salary form</h1>

      <form
        className={cn('space-y-2', props.className)}
        onSubmit={(e) => {
          e.stopPropagation();
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <div className="flex gap-2 [&>*]:basis-full">
          <form.Field
            name="min"
            validators={{
              onChangeListenTo: ['max'],
              onDynamic: ({ value, fieldApi }) => {
                const [min, max] = [
                  Number(value),
                  Number(fieldApi.form.getFieldValue('max')),
                ];

                if ([min, max].some(Number.isNaN)) return;

                if (min > max) {
                  return "Min can't be bigger than max";
                }
              },
            }}
            children={(field) => <FieldInput field={field} />}
          />

          <form.Field
            name="max"
            children={(field) => <FieldInput field={field} />}
          />

          <form.Field
            name="currency"
            children={(field) => (
              <FieldSelect field={field} items={currencyChoices} />
            )}
          />
        </div>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <SubmitButton type="submit" disabled={!canSubmit}>
              {isSubmitting ? '...' : 'Submit'}
            </SubmitButton>
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

function FieldSelect({
  field,
  items,
}: {
  field: AnyFieldApi;
  items: Array<{ value: string; name: string }>;
}) {
  return (
    <div className="space-y-2">
      <Label className="capitalize" htmlFor={field.name}>
        {field.name}
      </Label>

      <Select value={field.state.value} onValueChange={field.handleChange}>
        <SelectTrigger
          id={field.name}
          name={field.name}
          aria-invalid={!field.state.meta.isValid}
        >
          <SelectValue />
        </SelectTrigger>

        <SelectContent onBlur={field.handleBlur}>
          {items.map((item) => (
            <SelectItem value={item.value}>{item.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

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
