import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'FAQ - Tacoto.ch',
  description: 'Trouvez les réponses à vos questions les plus fréquentes.',
};

const faqData = [
  {
    question: "Comment puis-je créer une annonce ?",
    answer: "Pour créer une annonce, vous devez d'abord vous inscrire. Une fois connecté, cliquez sur le bouton 'Vendre ma voiture' dans le menu et suivez les étapes du formulaire."
  },
  {
    question: "La publication d'une annonce est-elle payante ?",
    answer: "Non, la publication d'annonces sur Tacoto.ch est entièrement gratuite pour les particuliers. Les professionnels peuvent être soumis à d'autres conditions."
  },
  {
    question: "Comment puis-je contacter un vendeur ?",
    answer: "Sur la page de détail d'une annonce, vous trouverez les informations de contact du vendeur (e-mail, et téléphone/WhatsApp si le vendeur a choisi de le partager). Vous pouvez le contacter directement."
  },
  {
    question: "Comment puis-je modifier mon profil ou mes annonces ?",
    answer: "Une fois connecté, vous pouvez accéder à 'Mon Profil' pour mettre à jour vos informations personnelles. Pour gérer vos annonces (les modifier ou les supprimer), rendez-vous dans la section 'Mes annonces'."
  },
   {
    question: "Que faire si une annonce me semble suspecte ?",
    answer: "La confiance est notre priorité. Si vous avez le moindre doute sur une annonce, veuillez nous contacter immédiatement via notre adresse email de contact en nous fournissant le lien de l'annonce en question."
  }
];

export default function FAQPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Foire Aux Questions (FAQ)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              {faqData.map((item, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-left font-semibold text-lg">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
