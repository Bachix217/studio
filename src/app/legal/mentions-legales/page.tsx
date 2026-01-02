'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

async function getLegalContent(firestore: any) {
  if (!firestore) return 'Erreur lors du chargement du contenu.';
  try {
    const docRef = doc(firestore, 'legal', 'legal-mentions');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().content;
    }
    return 'Contenu non trouvé.';
  } catch (error) {
    console.error("Error fetching legal content:", error);
    return 'Erreur lors du chargement du contenu.';
  }
}

export default function MentionsLegalesPage() {
  const { firestore } = useFirebase();
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We check if firestore is initialized before fetching the content
    if (firestore) {
      getLegalContent(firestore).then(data => {
        setContent(data);
        setLoading(false);
      });
    } else {
        // If firestore is not ready, we wait. The useFirebase hook will cause a re-render when it's ready.
        setLoading(true);
    }
  }, [firestore]);


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Mentions Légales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {loading ? (
              <div className="space-y-6">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-6 w-1/3 mt-4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
                <div 
                    className="prose prose-stone dark:prose-invert max-w-none text-card-foreground space-y-4"
                    dangerouslySetInnerHTML={{ __html: content?.replace(/\n/g, '<br />') || '' }} 
                />
            )}
            <p className="text-sm text-muted-foreground pt-4">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-CH')}
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
