
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  type?: "card" | "table" | "profile" | "form";
  count?: number;
}

const LoadingSkeleton = ({ type = "card", count = 1 }: LoadingSkeletonProps) => {
  const renderCardSkeleton = () => (
    <div className="space-y-2">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex space-x-2 py-2">
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
      <Skeleton className="h-10 w-full mt-4" />
    </div>
  );

  const renderTableSkeleton = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-60" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );

  const renderProfileSkeleton = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <Skeleton className="h-32 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );

  const renderFormSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-10 w-32" />
    </div>
  );

  let skeletonType;
  switch (type) {
    case "card":
      skeletonType = renderCardSkeleton;
      break;
    case "table":
      skeletonType = renderTableSkeleton;
      break;
    case "profile":
      skeletonType = renderProfileSkeleton;
      break;
    case "form":
      skeletonType = renderFormSkeleton;
      break;
    default:
      skeletonType = renderCardSkeleton;
  }

  return (
    <div className="w-full">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="mb-6">
          {skeletonType()}
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
