import VerifyForm from './VerifyForm';

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; error?: string }>;
}) {
  const { email = '', error } = await searchParams;
  return <VerifyForm email={email} authError={error} />;
}
