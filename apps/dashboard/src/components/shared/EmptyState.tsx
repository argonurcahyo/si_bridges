export function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-muted-foreground flex min-h-24 items-center justify-center rounded-md border border-dashed p-4 text-center text-sm">
      {message}
    </div>
  );
}
