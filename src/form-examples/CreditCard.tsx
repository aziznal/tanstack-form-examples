import z from 'zod';
import { revalidateLogic, useForm } from '@tanstack/react-form';
import { useEffect, useId, useState } from 'react';
import type { AnyFieldApi } from '@tanstack/react-form';
import { cn } from '@/lib/utils';
import { FormContainer } from '@/components/form-container';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/submit-button/submit-button';

const creditCardSchema = z.object({
  sixteenDigitNumber: z.string().regex(/\d{16}/, 'Must be 16 digits'),
  nameOnCard: z.string().min(1, 'This field is required'),
  cvc: z.string().regex(/\d{3}/, 'Must be 3 digits'),
  expirationDate: z
    .object({
      year: z
        .string()
        .regex(/^\d{4}$/, 'Must be four digits')
        .transform((s) => Number(s))
        .refine((n) => Number.isInteger(n), { message: 'Invalid year' })
        .refine((n) => n >= getCurrentYearMonth().year, {
          error: 'expiry year must be current year or later',
        })
        .refine((n) => n <= 2100, { message: 'yeah right' }),

      month: z
        .string()
        .regex(/\d{1,2}/, 'Must be 1 or 2 digits')
        .transform((s) => Number(s))
        .refine((n) => Number.isInteger(n), { error: 'Invalid month' })
        .refine((n) => n >= 1 && n <= 12, {
          error: 'Must be a number from 1 to 12',
        }),
    })
    .refine(
      (value) =>
        // if current year, month must not be current month or earlier
        value.year > getCurrentYearMonth().year ||
        (value.year === getCurrentYearMonth().year &&
          value.month >= getCurrentYearMonth().month),
      {
        error: 'Month cannot be earlier than current month',
      },
    ),
});

export type CreditCardForm = z.input<typeof creditCardSchema>;

export const CreditCardFormExample: React.FC<{ className?: string }> = (
  props,
) => {
  const form = useForm({
    formId: 'salary-form',
    defaultValues: {
      nameOnCard: '',
      sixteenDigitNumber: '',
      cvc: '',
      expirationDate: {
        year: '',
        month: '',
      },
    } as CreditCardForm,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: creditCardSchema,
    },
    onSubmitInvalid: () => {
      console.log('f');
    },
  });

  const [creditCardVisualizationSide, setCreditCardVisualizationSide] =
    useState<'front' | 'back'>('front');

  return (
    <FormContainer className={cn(props.className)}>
      <h1 className="text-2xl font-bold">Credit card form</h1>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.stopPropagation();
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <form.Subscribe
          children={({ values }) => (
            <div className="flex justify-center">
              <CreditCardVisualization
                currentSide={creditCardVisualizationSide}
                values={values}
              />{' '}
            </div>
          )}
        />

        <form.Field
          name="nameOnCard"
          children={(field) => (
            <FieldInput field={field} placeholder="John Doe" />
          )}
        />

        <form.Field
          name="sixteenDigitNumber"
          children={(field) => (
            <FieldInput field={field} placeholder="0000 0000 0000 0000" />
          )}
        />

        <form.Field
          name="cvc"
          listeners={{
            onBlur: () => setCreditCardVisualizationSide('front'),
          }}
          children={(field) => (
            <FieldInput
              onFocus={() => setCreditCardVisualizationSide('back')}
              field={field}
              placeholder="123"
            />
          )}
        />

        <div>
          <div className="flex gap-2 [&>*]:basis-full">
            <form.Field
              name="expirationDate.year"
              children={(field) => (
                <FieldInput field={field} placeholder="2025" />
              )}
            />

            <form.Field
              name="expirationDate.month"
              children={(field) => <FieldInput field={field} placeholder="7" />}
            />
          </div>

          <form.Field
            name="expirationDate"
            children={(field) => (
              <div>
                <FieldErrors field={field} />{' '}
              </div>
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

function getCurrentYearMonth(): { year: number; month: number } {
  const now = new Date();
  return {
    year: now.getFullYear(),
    // 1-12 instead of JS default 0-11
    month: now.getMonth() + 1,
  };
}

function FieldInput({
  field,
  placeholder,
  onFocus,
}: {
  field: AnyFieldApi;
  placeholder?: string;
  onFocus?: () => void;
}) {
  return (
    <div className="space-y-2" onFocus={onFocus}>
      <Label className="capitalize" htmlFor={field.name}>
        {field.name}
      </Label>

      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        onFocus={onFocus}
        placeholder={placeholder}
        aria-invalid={!field.state.meta.isValid}
      />

      <FieldErrors field={field} />
    </div>
  );
}

function FieldErrors({ field }: { field: AnyFieldApi }) {
  return (
    <div>
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

const ROTATION_DURATION_MS = 600;

export const CreditCardVisualization: React.FC<{
  className?: string;
  values: CreditCardForm;
  currentSide: 'front' | 'back';
}> = (props) => {
  const formatted16DigitNumber = [
    props.values.sixteenDigitNumber.substring(0, 4),
    props.values.sixteenDigitNumber.substring(4, 8),
    props.values.sixteenDigitNumber.substring(8, 12),
    props.values.sixteenDigitNumber.substring(12),
  ]
    .join(' ')
    .substring(0, 15 + 4);

  const id = useId();
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>(
    props.currentSide,
  );

  const rotate = (to: 'front' | 'back') => {
    const container = document.querySelector(`#${id}`) as HTMLElement;

    container.style.transform = ' rotateX(87deg) rotateZ(5deg)';

    setTimeout(() => {
      setCurrentSide(to);

      container.style.transform = 'rotateX(0deg) rotateZ(0deg)';
    }, ROTATION_DURATION_MS / 2);
  };

  useEffect(() => {
    if (currentSide === props.currentSide) return;
    rotate(props.currentSide);
  }, [props.currentSide]);

  return (
    <div
      className="w-[300px] aspect-[1.5] bg-gradient-to-br from-[#353535] to-[#151515] rounded-md p-3 select-none pointer-events-none font-mono"
      style={{
        transitionDuration: `${ROTATION_DURATION_MS / 2}ms`,
        transitionTimingFunction: 'ease-in-out',
      }}
      id={id}
    >
      {currentSide === 'front' && (
        <div className="flex flex-col">
          <div className="bg-amber-300 mt-[15%] w-[52px] h-[38px] rounded-md mb-2" />

          <div className="flex flex-col">
            <span className="text-2xl whitespace-nowrap font-bold min-h-lh">
              {formatted16DigitNumber}
            </span>

            <span className="text-muted-foreground text-[8px] min-h-lh">
              {formatted16DigitNumber.substring(0, 4)}
            </span>
          </div>

          <div className="flex gap-2 self-center -ml-6">
            <div className="flex flex-col text-[8px] text-muted-foreground text-center">
              <p>VALID</p>
              <p>THRU</p>
            </div>

            <div className="min-h-lh">
              {props.values.expirationDate.year.substring(2, 4)}/
              {props.values.expirationDate.month.substring(0, 2)}
            </div>
          </div>

          <div className="uppercase text-muted-foreground min-h-lh line-clamp-1 whitespace-nowrap">
            {props.values.nameOnCard}
          </div>
        </div>
      )}

      {currentSide === 'back' && (
        <div className="flex flex-col">
          <span className="text-[7px] text-muted-foreground mb-2">
            Lorem ipsum dolor sit amet consectetur
          </span>

          <div className="h-[50px] bg-gradient-to-r from-neutral-900 to-neutral-950 -ml-3 -mr-3 mb-1" />

          <span className="text-[7px] text-muted-foreground mb-2 text-center">
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
          </span>

          <div className="h-[35px] mb-3 bg-neutral-200 text-end text-background flex items-center justify-end pe-4">
            <span className="skew-x-16">
              {props.values.cvc.substring(0, 3)}
            </span>
          </div>

          <span className="text-[7px] text-muted-foreground mb-2 text-center">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Natus
            laborum, reprehenderit, quis nobis similique minus, molestiae id
            fuga cum nihil nulla
          </span>
        </div>
      )}
    </div>
  );
};
