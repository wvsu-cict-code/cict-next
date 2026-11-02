import { Metadata } from "next";
import AdminForm from "@/components/admin/AdminForm";
import { CheckboxField, TextAreaField } from "@/components/admin/fields";
import { Icon } from "@/components/admin/icons";
import PageHeader, {
  FormSection,
  SecondaryLink,
} from "@/components/admin/PageHeader";
import SavedNotice from "@/components/admin/SavedNotice";
import { requireAdmin } from "@/lib/cms/auth";
import { fetchSiteSettings } from "@/lib/cms/content";
import { DEFAULT_MAINTENANCE_MESSAGE } from "@/lib/maintenance";
import { siteUrl } from "@/lib/site";
import { updateSettings } from "./actions";

export const metadata: Metadata = {
  title: "Settings",
};

interface PageProps {
  searchParams: Promise<{ saved?: string }>;
}

export default async function SettingsPage({ searchParams }: PageProps) {
  const { saved } = await searchParams;
  const { supabase } = await requireAdmin();
  const settings = await fetchSiteSettings(supabase);

  return (
    <>
      <PageHeader
        title="Settings"
        description="Switches that change how the public website behaves."
        actions={
          <SecondaryLink href={siteUrl("/")} icon="eye" external>
            View landing page
          </SecondaryLink>
        }
      />
      {saved && <SavedNotice message="Settings saved." />}

      {settings === null ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          <Icon name="alert" className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Settings aren&apos;t available yet.</p>
            <p className="mt-1">
              Apply the database migration{" "}
              <code>supabase/migrations/20261030000000_site_settings.sql</code>{" "}
              to the Supabase project, then reload this page.
            </p>
          </div>
        </div>
      ) : (
        // Keyed on updated_at so a save remounts the form with fresh values
        <AdminForm
          key={settings.updated_at}
          action={updateSettings}
          submitLabel="Save settings"
        >
          <FormSection
            title="Landing page maintenance"
            description="While this is on, the home page shows a maintenance notice instead of its usual content. The other pages (Programs, News, Faculty, Contact) stay available, and the change takes effect for visitors as soon as you save."
          >
            <CheckboxField
              label="Maintenance mode"
              name="maintenance_mode"
              defaultChecked={settings.maintenance_mode}
              hint="Turn off to bring the home page back."
            />
            <TextAreaField
              label="Message for visitors"
              name="maintenance_message"
              rows={4}
              defaultValue={settings.maintenance_message}
              hint={`Leave empty to use the default: “${DEFAULT_MAINTENANCE_MESSAGE}”`}
            />
          </FormSection>
        </AdminForm>
      )}
    </>
  );
}
