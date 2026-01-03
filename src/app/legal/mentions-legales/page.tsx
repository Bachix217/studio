'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function MentionsLegalesPage() {
  const { firestore } = useFirebase();
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // La fonction fetch sera appelée uniquement quand firestore est disponible.
    const fetchContent = async () => {
      if (!firestore) {
        // Si firestore n'est pas encore prêt, on attend.
        // Le useEffect sera ré-exécuté quand `firestore` changera.
        return;
      }
      
      setLoading(true);
      try {
        const docRef = doc(firestore, 'legal', 'legal-mentions');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setContent(docSnap.data().content);
          setError(null);
        } else {
          setError('Le document des mentions légales est introuvable.');
        }
      } catch (e) {
        console.error("Error fetching legal content:", e);
        setError('Une erreur est survenue lors du chargement du contenu.');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
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
            ) : error ? (
                 <p className="text-destructive">{error}</p>
            ) : (
                <div 
                    className="prose prose-stone dark:prose-invert max-w-none text-card-foreground space-y-4"
                    dangerouslySetInnerHTML={{ __html: content || '' }} 
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
