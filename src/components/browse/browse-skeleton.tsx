import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

function UserCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="size-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-16 rounded-full" />
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full rounded-lg" />
      </CardFooter>
    </Card>
  );
}

export function BrowseFiltersSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card/50 p-4 backdrop-blur sm:flex-row sm:items-end">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-40 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  );
}

export function BrowseGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <UserCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function BrowsePageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-72 max-w-full" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <BrowseFiltersSkeleton />
      <div className="flex gap-4">
        <Skeleton className="h-8 w-28 rounded-full" />
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
      <BrowseGridSkeleton />
    </div>
  );
}
