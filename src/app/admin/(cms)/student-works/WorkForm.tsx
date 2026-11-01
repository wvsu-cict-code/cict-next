"use client";

import { useState } from "react";
import AdminForm from "@/components/admin/AdminForm";
import { FormSection } from "@/components/admin/PageHeader";
import {
  CheckboxField,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/admin/fields";
import type { FormState } from "@/lib/cms/forms";
import type { StudentWork } from "@/lib/cms/content";
import type { UploadedWorkImage } from "@/lib/studentWorks/form";
import { parseYouTubeUrl, youtubeWatchUrl } from "@/lib/studentWorks/youtube";
import WorkImageField from "./WorkImageField";

interface WorkFormProps {
  work?: StudentWork;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}

type Kind = StudentWork["kind"];
type Orientation = "landscape" | "vertical";

function imageOf(work?: StudentWork): UploadedWorkImage | null {
  if (!work?.image_url || !work.image_width || !work.image_height) return null;
  return {
    image_url: work.image_url,
    image_width: work.image_width,
    image_height: work.image_height,
    zoom_url: work.zoom_url,
    zoom_width: work.zoom_width,
    zoom_height: work.zoom_height,
    original_url: work.original_url ?? "",
  };
}

export default function WorkForm({ work, action }: WorkFormProps) {
  const [kind, setKind] = useState<Kind>(work?.kind ?? "art");
  const [orientation, setOrientation] = useState<Orientation>(
    work?.orientation ?? "landscape",
  );
  // Until the admin picks an orientation, follow the link (Shorts = vertical)
  const [orientationTouched, setOrientationTouched] = useState(false);

  const image = imageOf(work);
  const youtubeDefault = work?.youtube_id
    ? youtubeWatchUrl(work.youtube_id, work.orientation ?? "landscape")
    : "";

  return (
    <AdminForm
      key={work?.updated_at}
      action={action}
      submitLabel={work ? "Save changes" : "Create student work"}
    >
      <div className="max-w-3xl space-y-6">
        <FormSection title="The work">
          <SelectField
            label="Type"
            name="kind"
            defaultValue={kind}
            options={[
              { value: "art", label: "Digital art" },
              { value: "video", label: "Video" },
              { value: "game", label: "Game" },
            ]}
            onValueChange={(value) => setKind(value as Kind)}
          />
          <TextField
            label="Title"
            name="title"
            required
            defaultValue={work?.title}
          />
          <TextField
            label="Student or team"
            name="student"
            required
            defaultValue={work?.student}
            hint="For a team, enter the team name or the members' names."
          />
          <TextAreaField
            label="Description"
            name="description"
            required
            rows={4}
            defaultValue={work?.description}
          />
        </FormSection>

        <FormSection title="Media">
          {kind === "art" && (
            <WorkImageField
              name="image"
              label="Artwork"
              withZoom
              defaultValue={image}
            />
          )}
          {kind === "game" && (
            <>
              <WorkImageField
                name="image"
                label="Screenshot"
                withZoom={false}
                defaultValue={image}
              />
              <TextField
                label="Store link"
                name="store_url"
                required
                defaultValue={work?.store_url}
              />
            </>
          )}
          {kind === "video" && (
            <>
              <TextField
                label="YouTube link"
                name="youtube_url"
                required
                defaultValue={youtubeDefault}
                onValueChange={(value) => {
                  if (orientationTouched) return;
                  setOrientation(
                    parseYouTubeUrl(value)?.isShort ? "vertical" : "landscape",
                  );
                }}
              />
              <SelectField
                label="Orientation"
                name="orientation"
                value={orientation}
                options={[
                  { value: "landscape", label: "Landscape" },
                  { value: "vertical", label: "Vertical" },
                ]}
                onValueChange={(value) => {
                  setOrientationTouched(true);
                  setOrientation(value as Orientation);
                }}
              />
              <WorkImageField
                name="image"
                label="Thumbnail (optional)"
                withZoom={false}
                hint="Recommended for vertical videos. Without one, the site uses YouTube's thumbnail."
                defaultValue={image}
              />
            </>
          )}
          <TextField
            label="Portfolio link (optional)"
            name="portfolio_url"
            defaultValue={work?.portfolio_url}
          />
        </FormSection>

        <FormSection title="Visibility">
          <CheckboxField
            label="Show on the BSEMC page"
            name="visible"
            defaultChecked={work?.visible ?? true}
          />
        </FormSection>
      </div>
    </AdminForm>
  );
}
