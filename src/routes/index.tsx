import { createFileRoute } from '@tanstack/react-router';
import { LoginFormExample } from '@/form-examples/Login';

export const Route = createFileRoute('/')({
  component: App,
});

function App() {
  return (
    <div className="p-6">
      <LoginFormExample />
    </div>
  );
}
