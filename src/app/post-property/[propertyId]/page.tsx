import ContentLayout from "@/components/postProperty/contentLayout";
import MainLayout from "@/components/postProperty/mainLayout";
import { PROPERTY_FORM_MODE } from "@/lib/enums";


export default async function PostProperty({
  searchParams,
}: {
  searchParams: Promise<{ continueCreate?: string }>;
}) {
  const params = await searchParams;
  // When step-1 just finished creating the draft it navigates here with
  // ?continueCreate=true so the form keeps the freshly advanced step.
  // Without the flag we treat the visit as a user-initiated Edit and reset
  // to step 1 (per product spec).
  const mode =
    params?.continueCreate === "true"
      ? PROPERTY_FORM_MODE.CREATE
      : PROPERTY_FORM_MODE.EDIT;
  return (
    <MainLayout>
      <ContentLayout mode={mode} />
    </MainLayout>
  );
}
