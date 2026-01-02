import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: "Conditions Générales d'Utilisation - Tacoto.ch",
  description: "Consultez les Conditions Générales d'Utilisation (CGU) de Tacoto.ch.",
};

export default function CGUPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Conditions Générales d'Utilisation (CGU)</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-stone dark:prose-invert max-w-none text-card-foreground space-y-6 pt-6">

            <p>
              Bienvenue sur Tacoto.ch. L'utilisation de ce site est régie par les présentes Conditions Générales d'Utilisation. En accédant à ce site, vous acceptez ces conditions dans leur intégralité.
            </p>

            <section>
              <h2 className="text-xl font-semibold">1. Objet</h2>
              <p>
                Tacoto.ch est une plateforme en ligne permettant à des utilisateurs (ci-après "Vendeurs") de publier des annonces pour la vente de véhicules, et à d'autres utilisateurs (ci-après "Acheteurs") de consulter ces annonces. Le site a pour seul but de faciliter la mise en relation. Tacoto.ch n'intervient pas dans la transaction entre le Vendeur et l'Acheteur.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold">2. Compte Utilisateur</h2>
              <p>
                La création d'un compte est nécessaire pour publier une annonce. L'utilisateur s'engage à fournir des informations exactes et à les maintenir à jour. Le mot de passe est strictement confidentiel et ne doit pas être partagé.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">3. Responsabilité des Vendeurs</h2>
              <p>
                Le Vendeur est seul responsable du contenu de son annonce (description, prix, photos, caractéristiques du véhicule). Il s'engage à ce que les informations fournies soient véridiques, exactes et ne portent pas préjudice à des tiers. La publication d'annonces frauduleuses ou illégales est strictement interdite et entraînera la suppression du compte.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">4. Responsabilité de Tacoto.ch</h2>
              <p>
                Tacoto.ch agit en tant qu'intermédiaire technique. Nous ne garantissons pas la qualité, la sécurité ou la légalité des véhicules mis en vente, ni la véracité des annonces. Nous ne saurions être tenus responsables en cas de litige entre un Vendeur et un Acheteur. Nous nous efforçons de maintenir le site accessible, mais ne pouvons garantir une disponibilité ininterrompue.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">5. Propriété Intellectuelle</h2>
              <p>
                Tous les éléments du site Tacoto.ch (logo, textes, design) sont la propriété exclusive de Tacoto.ch. Toute reproduction sans autorisation est interdite.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">6. Droit applicable et for</h2>
              <p>
                Les présentes CGU sont soumises au droit suisse. En cas de litige, le for juridique est établi à Genève, Suisse.
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
