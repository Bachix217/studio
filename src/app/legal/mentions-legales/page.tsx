import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Mentions Légales - Tacoto.ch',
  description: 'Consultez les mentions légales de Tacoto.ch.',
};

export default function MentionsLegalesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Mentions Légales</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-stone dark:prose-invert max-w-none text-card-foreground space-y-6 pt-6">
            
            <section>
              <h2 className="text-xl font-semibold">Éditeur du site</h2>
              <p>
                Le site Tacoto.ch est édité par :<br />
                <strong>Tacoto.ch</strong><br />
                Genève, Suisse
              </p>
              <p>
                <strong>Représentant légal :</strong> Tacoto.ch
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold">Contact</h2>
              <p>
                Pour toute question ou demande, vous pouvez nous contacter à l'adresse suivante :<br />
                <strong>Email :</strong> info@tacoto.ch
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">Hébergement</h2>
              <p>
                Le site est hébergé par :<br />
                <strong>Google Cloud Platform / Firebase Hosting</strong><br />
                Gordon House, Barrow Street, Dublin 4, Irlande
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">Propriété intellectuelle</h2>
              <p>
                L'ensemble de ce site relève de la législation suisse et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques. La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse de l'éditeur.
              </p>
            </section>

             <section>
              <h2 className="text-xl font-semibold">Limitation de responsabilité</h2>
              <p>
                L'éditeur du site ne saurait être tenu pour responsable des erreurs, omissions, ou pour les résultats qui pourraient être obtenus par l'usage des informations présentes sur le site. Les annonces publiées sur le site sont sous l'entière responsabilité de leurs auteurs.
              </p>
            </section>

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
