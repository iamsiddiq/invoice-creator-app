import VerifyForm from './VerifyForm';

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; error?: string }>;
}) {
  const { email = '' } = await searchParams;
  return <VerifyForm email={email} />;
}
