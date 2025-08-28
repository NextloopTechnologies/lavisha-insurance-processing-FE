export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold text-red-500">Access Denied</h1>
      <p className="mt-2 text-gray-600">
        You do not have permission to view this page.
      </p>
    </div>
  );
}
