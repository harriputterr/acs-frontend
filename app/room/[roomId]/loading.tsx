// app/room/[roomId]/loading.tsx
export default function LoadingRoom() {
  return (
    <div className="flex items-center justify-center h-full">
      {/* simple CSS spinner */}
      <div
        className="animate-spin rounded-full h-12 w-12 border-4
                   border-t-transparent border-orange-500"
      />
    </div>
  );
}
