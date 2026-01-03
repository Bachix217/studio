'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
              <h2 className="text-xl font-semibold">1. PRÉSENTATION DU SITE</h2>
              <p>
                En vertu de la législation suisse sur la protection des données (LPD), il est précisé aux utilisateurs du site tacotoch.ch l'identité du responsable de sa publication :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Propriétaire et Éditeur :</strong> Jérémy Bächtold, agissant à titre privé et non professionnel.</li>
                <li><strong>Contact :</strong> info@tacoto.ch</li>
                <li><strong>Statut :</strong> Projet personnel à but non lucratif. Le site et ses services sont mis à disposition gratuitement.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">2. HÉBERGEMENT ET STOCKAGE DES DONNÉES</h2>
              <p>Le site est propulsé par les technologies Firebase (Google Cloud Platform).</p>
               <ul className="list-disc pl-6 space-y-2">
                <li><strong>Hébergeur :</strong> Google Cloud Platform</li>
                <li><strong>Localisation des serveurs :</strong> Suisse (Région europe-west6, Zurich).</li>
                <li><strong>Sécurité :</strong> Les données sont stockées localement à Zurich pour garantir une conformité optimale avec la Loi fédérale sur la protection des données (LPD).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">3. CONDITIONS GÉNÉRALES D'UTILISATION (CGU)</h2>
              <p>L'utilisation du site implique l'acceptation des conditions suivantes :</p>
               <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Nature du service :</strong> Tacoto est une plateforme de mise en relation entre particuliers pour la vente de véhicules.</li>
                  <li><strong>Absence de responsabilité :</strong> L'éditeur agit en tant qu'intermédiaire technique uniquement. Il ne participe pas aux transactions et décline toute responsabilité en cas de litige, de fraude, d'inexactitude des descriptions ou de vices cachés sur les véhicules.</li>
                  <li><strong>Modération :</strong> L'éditeur se réserve le droit de refuser ou de supprimer toute annonce jugée suspecte, incomplète ou frauduleuse après vérification manuelle.</li>
               </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">4. PROTECTION DES DONNÉES PERSONNELLES (LPD)</h2>
              <p>Conformément à la nouvelle Loi fédérale sur la protection des données (nLPD) entrée en vigueur en septembre 2023 :</p>
               <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Données collectées :</strong> Adresse e-mail, données d'authentification (via Firebase Auth) et contenu des annonces.</li>
                  <li><strong>Finalité :</strong> Les données servent exclusivement à la gestion des comptes et à la mise en relation via le formulaire de contact du site.</li>
                  <li><strong>Confidentialité :</strong> Aucune donnée personnelle n'est vendue, louée ou transmise à des tiers à des fins commerciales.</li>
                  <li><strong>Droits :</strong> Vous disposez d'un droit d'accès, de modification et de suppression de vos données personnelles sur simple demande à info@tacoto.ch.</li>
               </ul>
            </section>
            
             <section>
              <h2 className="text-xl font-semibold">5. PROPRIÉTÉ INTELLECTUELLE</h2>
              <p>
                Le nom "Tacoto" et l'interface du site sont la propriété de l'éditeur. Les logos des constructeurs automobiles (Audi, BMW, etc.) restent la propriété de leurs marques respectives et sont utilisés uniquement à des fins d'identification des modèles.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">6. DROIT APPLICABLE</h2>
              <p>
                Le présent site est exclusivement soumis au droit suisse. Tout litige relatif à son utilisation sera porté devant les tribunaux compétents de Genève.
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
