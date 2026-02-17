import ContactLeadForm from '@/app/contact/ContactLeadForm';
import Section from '@/app/components/Section';
import PageHero from '@/app/components/PageHero';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lead | Conjoin',
  description: 'Submit a lead to Conjoin CRM'
};

export default function LeadPage() {
  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <PageHero
          title="Submit Lead"
          subtitle="Quickly send us your requirement"
          ctas={[{ href: '/contact', label: 'Contact' }]}
        />
      </Section>
      <Section tone="alt" className="py-10 md:py-14">
        <div className="grid gap-5 lg:grid-cols-[1fr_minmax(0,1.05fr)]">
          <ContactLeadForm />
        </div>
      </Section>
    </div>
  );
}
