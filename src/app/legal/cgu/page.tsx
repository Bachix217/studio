
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
              L'utilisation du site Tacoto.ch implique l'acceptation pleine et entière des présentes conditions par l'utilisateur.
            </p>

            <section>
              <h2 className="text-xl font-semibold">1. Objet du service</h2>
              <p>
                Tacoto.ch est une plateforme gratuite de mise en relation entre particuliers et professionnels pour la vente de véhicules en Suisse. Le site n'est pas une partie à la transaction et n'agit qu'en tant qu'intermédiaire technique et hébergeur d'annonces.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold">2. Accès et Sécurité (Vérification SMS)</h2>
              <p>Pour garantir la sécurité de la communauté et lutter contre la fraude internationale :</p>
               <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Compte Utilisateur :</strong> La création d'un compte est obligatoire pour publier une annonce ou consulter les coordonnées d'un vendeur.</li>
                  <li><strong>Vérification Suisse (+41) :</strong> L'accès aux données de contact est strictement réservé aux membres ayant validé leur compte via un code envoyé par SMS sur un numéro de téléphone mobile suisse (+41).</li>
                  <li><strong>Numéros interdits :</strong> L'utilisation de numéros virtuels (VOIP) ou de numéros étrangers pour contourner cette sécurité est interdite et entraînera la suppression immédiate du compte.</li>
               </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">3. Processus de Publication et Modération Manuelle</h2>
              <p>Afin de maintenir un haut niveau de sécurité, Tacoto.ch applique un contrôle strict des contenus avant leur mise en ligne :</p>
              <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Validation Préalable :</strong> Toute annonce créée n'est pas publiée immédiatement. Elle est soumise à une validation manuelle par le modérateur avant d'être visible sur le site.</li>
                  <li><strong>Vérification Téléphonique :</strong> L'éditeur se réserve le droit de contacter le vendeur par téléphone pour vérifier la validité du numéro et l'authenticité de l'annonce avant sa mise en ligne.</li>
                  <li><strong>Droit de Refus :</strong> L'éditeur est seul juge de la pertinence d'une annonce et peut refuser la publication sans préavis s'il juge que les informations sont incomplètes, le prix irréaliste, ou en cas de suspicion de fraude.</li>
               </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">4. Obligations de l'Annonceur</h2>
              <p>L'utilisateur s'engage à :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fournir des informations exactes, sincères et des photos réelles du véhicule proposé.</li>
                <li>Être joignable sur le numéro de téléphone suisse lié à son compte pour la vérification de l'annonce.</li>
                <li>Supprimer son annonce dès que le véhicule est vendu ou n'est plus disponible.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">5. Responsabilité et Exclusion de Garantie</h2>
               <ul className="list-disc pl-6 space-y-2">
                <li><strong>Transactions :</strong> Tacoto.ch ne participe à aucune étape du paiement, de la livraison ou de la garantie des véhicules. La responsabilité de l'éditeur ne peut être engagée en cas de litige entre acheteur et vendeur.</li>
                <li><strong>Disponibilité :</strong> Bien que les données soient stockées de manière sécurisée à Zurich (Région europe-west6), l'éditeur ne peut garantir une disponibilité ininterrompue du service en cas de maintenance ou de panne technique externe.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold">6. Protection des Données (LPD)</h2>
              <p>
                L'utilisation du site est régie par notre Politique de Confidentialité. Les données personnelles sont traitées conformément à la législation suisse et stockées localement à Zurich.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">7. Propriété Intellectuelle</h2>
              <p>
                L'interface, le logo et le nom "Tacoto.ch" sont protégés. Les logos des marques automobiles (Audi, BMW, etc.) restent la propriété de leurs détenteurs respectifs et sont utilisés uniquement à des fins d'identification des véhicules.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold">8. Droit Applicable et Forum</h2>
              <p>
                Les présentes CGU sont soumises exclusivement au droit suisse. En cas de litige, les tribunaux de Genève, Suisse, sont seuls compétents.
              </p>
            </section>

            <p className="text-sm text-muted-foreground pt-4">
              Dernière mise à jour : 3 janvier 2026
            </p>

          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
