import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
            <div className="lg:col-span-3">
                <Skeleton className="aspect-[4/3] w-full h-full" />
            </div>
            <div className="lg:col-span-2 p-6 flex flex-col gap-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-9 w-3/4" />
                <Skeleton className="h-8 w-1/2" />
                <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex flex-col gap-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-4 w-12" />
                        </div>
                    </div>
                ))}
                </div>
                <div className="mt-auto pt-8 flex flex-col sm:flex-row gap-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                </div>
            </div>
            </div>
            <div className="p-6 border-t">
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-20 w-full" />
                 <Skeleton className="h-6 w-48 mt-8 mb-4" />
                 <Skeleton className="h-40 w-full" />
            </div>
      </div>
      </main>
      <Footer />
    </>
  );
}
