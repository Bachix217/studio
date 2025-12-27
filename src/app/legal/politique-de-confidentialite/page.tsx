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
              La protection de vos données personnelles est une priorité pour Tacoto.ch. Cette politique de confidentialité vous informe sur la manière dont nous collectons, utilisons et protégeons vos données dans le respect de la Loi fédérale sur la protection des données (LPD).
            </p>

            <section>
              <h2 className="text-xl font-semibold">1. Responsable du traitement</h2>
              <p>
                Le responsable du traitement de vos données est :<br />
                <strong>[Raison sociale de votre entreprise]</strong><br />
                [Votre adresse postale]<br />
                [Code Postal], [Ville], Suisse<br />
                Email : [Votre adresse email de contact]
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold">2. Données collectées</h2>
              <p>Nous collectons les données que vous nous fournissez directement :</p>
              <ul>
                <li><strong>Création de compte :</strong> Adresse e-mail, mot de passe.</li>
                <li><strong>Profil utilisateur :</strong> Nom d'affichage, numéro de téléphone (si fourni), type de compte (particulier/professionnel), et informations professionnelles le cas échéant.</li>
                <li><strong>Publication d'annonces :</strong> Toutes les informations relatives au véhicule que vous publiez.</li>
                <li><strong>Communication :</strong> Le contenu des messages que vous pourriez nous envoyer.</li>
              </ul>
              <p>Nous utilisons les services de Firebase (Google) pour l'authentification des utilisateurs et le stockage des données. L'utilisation de ces services peut impliquer la collecte de données techniques (adresse IP, type de navigateur) par Google.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">3. Finalités du traitement</h2>
              <p>Vos données sont utilisées pour les finalités suivantes :</p>
              <ul>
                <li>Fournir, gérer et améliorer nos services (création de compte, publication d'annonces).</li>
                <li>Permettre la mise en relation entre vendeurs et acheteurs.</li>
                <li>Répondre à vos demandes de contact.</li>
                <li>Assurer la sécurité de notre plateforme.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">4. Partage des données</h2>
              <p>
                Les informations de votre profil public (nom, canton, et numéro de téléphone si vous autorisez son partage) sont visibles sur vos annonces pour permettre aux acheteurs de vous contacter.
              </p>
              <p>
                Nous ne vendons, n'échangeons et ne transférons pas vos données personnelles identifiables à des tiers, sauf dans le cadre de l'utilisation de services tiers nécessaires au fonctionnement du site (comme Firebase) ou si la loi nous y oblige.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">5. Vos droits</h2>
              <p>Conformément à la LPD, vous disposez des droits suivants :</p>
              <ul>
                <li><strong>Droit d'accès :</strong> Vous pouvez demander à consulter les données que nous détenons sur vous.</li>
                <li><strong>Droit de rectification :</strong> Vous pouvez à tout moment modifier les informations de votre profil directement depuis votre compte.</li>
                <li><strong>Droit à l'effacement :</strong> Vous pouvez demander la suppression de votre compte et des données associées.</li>
              </ul>
              <p>Pour exercer ces droits, veuillez nous contacter à l'adresse e-mail mentionnée ci-dessus.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold">6. Modifications</h2>
              <p>
                Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. La version la plus récente est celle publiée sur cette page.
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
