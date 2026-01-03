
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Politique de Confidentialité - Tacoto.ch',
  description: 'Consultez notre politique de confidentialité.',
};

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Politique de Confidentialité</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-stone dark:prose-invert max-w-none text-card-foreground space-y-6 pt-6">

            <p>
              La protection de votre vie privée est une priorité absolue pour Tacoto.ch. Cette politique détaille comment nous traitons vos données conformément à la Loi fédérale sur la protection des données (LPD) suisse.
            </p>

            <section>
              <h2 className="text-xl font-semibold">1. Responsable du traitement</h2>
              <p>
                Le site Tacoto.ch est un projet personnel géré à titre privé par :<br />
                <strong>Éditeur :</strong> Jérémy Bächtold<br />
                <strong>Siège :</strong> Genève, Suisse<br />
                <strong>Contact :</strong> info@tacoto.ch
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold">2. Données collectées</h2>
              <p>Nous collectons les informations strictement nécessaires à la sécurisation des échanges :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Compte :</strong> Adresse e-mail et mot de passe (via Firebase Auth).</li>
                <li><strong>Sécurité et Vérification :</strong> Numéro de téléphone portable pour la vérification par SMS.</li>
                <li><strong>Annonces :</strong> Détails du véhicule, photos, canton et prix.</li>
                <li><strong>Données techniques :</strong> Adresse IP et logs de connexion (pour la prévention des cyberattaques).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">3. Stockage des données à Zurich</h2>
              <p>Pour garantir la souveraineté et la sécurité de vos données :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Localisation :</strong> Toutes vos données (comptes, annonces, photos) sont stockées exclusivement à Zurich, Suisse (Région Google Cloud europe-west6).</li>
                <li><strong>Conformité :</strong> Ce stockage local garantit que vos données restent sous la protection juridique du droit suisse.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold">4. Protection contre la fraude (Vérification SMS)</h2>
              <p>Pour protéger nos utilisateurs contre les brouteurs et les tentatives d'arnaques internationales, nous appliquons une politique de sécurité stricte :</p>
               <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Accès restreint :</strong> Les coordonnées des vendeurs (nom, numéro de téléphone, formulaire de contact) ne sont jamais publiques.</li>
                  <li><strong>Validation Suisse :</strong> Ces données ne sont accessibles qu'aux utilisateurs connectés ayant fait l'objet d'une vérification par SMS avec un numéro de téléphone suisse (+41).</li>
                  <li><strong>Filtrage :</strong> Toute tentative de connexion via des numéros virtuels ou étrangers pourra être bloquée pour assurer la sécurité de la communauté.</li>
               </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">5. Finalités du traitement</h2>
              <p>Vos données sont traitées pour :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>La création et la gestion technique de votre espace utilisateur.</li>
                <li>La mise en relation sécurisée entre acheteurs vérifiés et vendeurs.</li>
                <li>La modération manuelle des annonces pour garantir l'absence de fraude.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold">6. Partage et Confidentialité</h2>
               <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Zéro Revente :</strong> Nous ne vendons, ne louons et ne partageons aucune donnée personnelle à des fins marketing ou à des tiers.</li>
                  <li><strong>Visibilité :</strong> Vos données de contact ne sont révélées qu'aux acheteurs ayant prouvé leur identité via un numéro suisse.</li>
               </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">7. Vos Droits</h2>
              <p>Conformément à la LPD, vous disposez d'un droit d'accès, de rectification et de suppression totale de vos données. Pour exercer ces droits ou fermer votre compte, contactez-nous à : info@tacoto.ch.</p>
            </section>
            
             <section>
              <h2 className="text-xl font-semibold">8. Absence de responsabilité commerciale</h2>
              <p>Tacoto.ch est une plateforme gratuite de mise en relation gérée à titre privé. L'éditeur ne participe pas aux transactions et décline toute responsabilité en cas de litige, de fraude ou d'erreur dans les descriptions de véhicules.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold">9. Modifications</h2>
              <p>
                Cette politique peut être mise à jour. La date de dernière modification sera toujours affichée en haut de page.
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
