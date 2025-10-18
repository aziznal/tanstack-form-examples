import z from 'zod';
import { useForm, useStore } from '@tanstack/react-form';
import { LucidePlus, LucideTrash } from 'lucide-react';
import type { AnyFieldApi } from '@tanstack/react-form';
import { FormContainer } from '@/components/form-container';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/submit-button/submit-button';

const groceryItemSchema = z.object({
  name: z.string().min(1, 'name is required'),
  count: z.coerce.number<number>().min(1, 'count is required'),
  isChecked: z.coerce.boolean<boolean>(),
});

const groceriesSchema = z
  .array(groceryItemSchema)
  .min(1, 'Must have at least one item in your grocery list');

type GroceriesForm = z.input<typeof groceriesSchema>;

export const GroceriesListFormExample: React.FC = () => {
  const form = useForm({
    defaultValues: {
      groceries: [
        {
          name: 'Milk',
          count: 1,
          isChecked: true,
        },
        {
          name: 'Coffee',
          count: 2,
          isChecked: false,
        },
      ] as GroceriesForm,
    },
    onSubmitInvalid: () => {
      console.log('f');
    },
  });

  const isItemChecked = useStore(form.store, (value) =>
    value.values.groceries.map((v) => v.isChecked),
  );

  return (
    <FormContainer>
      <h1 className="text-2xl font-bold">Groceries list form</h1>

      <form
        onSubmit={(e) => {
          e.stopPropagation();
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <form.Field
          name="groceries"
          validators={{
            onChange: groceriesSchema,
          }}
          children={(field) => (
            <div>
              {field.state.value.map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <form.Field
                    /** NOTE: this is typesafe! 🙌 */
                    name={`groceries[${i}].isChecked`}
                    validators={{
                      onChange: groceryItemSchema.shape.isChecked,
                    }}
                    children={(subfield) => (
                      <Checkbox
                        id={subfield.name}
                        name={subfield.name}
                        checked={subfield.state.value}
                        onCheckedChange={(value) =>
                          subfield.handleChange(Boolean(value.valueOf()))
                        }
                        onBlur={subfield.handleBlur}
                      />
                    )}
                  />

                  <form.Field
                    name={`groceries[${i}].name`}
                    validators={{
                      onChange: groceryItemSchema.shape.name,
                    }}
                    children={(subfield) => (
                      <FieldInput
                        field={subfield}
                        disabled={isItemChecked[i]}
                      />
                    )}
                  />

                  <form.Field
                    name={`groceries[${i}].count`}
                    validators={{
                      onChange: groceryItemSchema.shape.count,
                    }}
                    children={(subfield) => (
                      <div className="w-[30px]">
                        <FieldInput
                          field={subfield}
                          disabled={isItemChecked[i]}
                        />
                      </div>
                    )}
                  />

                  <div
                    className="border rounded-full p-2 -mt-3 hover:text-destructive"
                    onClick={() => field.removeValue(i)}
                  >
                    <LucideTrash className="shrink-0" size="16" />
                  </div>
                </div>
              ))}

              <div className="mb-4">
                <FieldErrors field={field} />
              </div>
            </div>
          )}
        />

        <div
          className="mb-4 p-3 border rounded-md flex items-center justify-center hover:bg-background transition-colors duration-75"
          onClick={() =>
            form.pushFieldValue('groceries', {
              name: 'untitled',
              count: 1,
              isChecked: false,
            })
          }
        >
          <LucidePlus />
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

function FieldInput({
  field,
  disabled,
}: {
  field: AnyFieldApi;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label className="capitalize" htmlFor={field.name}>
        {field.name}
      </Label>

      <Input
        aria-invalid={!field.state.meta.isValid}
        id={field.name}
        name={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        disabled={disabled}
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
