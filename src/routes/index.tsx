import { createFileRoute } from '@tanstack/react-router';
import { LoginFormExample } from '@/form-examples/Login';
import { GroceriesListFormExample } from '@/form-examples/GroceriesList';
import { SalaryFormExample } from '@/form-examples/SalaryForm';

export const Route = createFileRoute('/')({
  component: App,
});

function App() {
  return (
    <div className="p-6 space-y-24 pb-24">
      <LoginFormExample />

      <GroceriesListFormExample />

      <SalaryFormExample />
    </div>
  );
}
