import ContentLayout from "@/components/postProperty/contentLayout";
import MainLayout from "@/components/postProperty/mainLayout";
import { PROPERTY_FORM_MODE } from "@/lib/enums";


export default function PostProperty() {
  return (
    <MainLayout>
      <ContentLayout mode={PROPERTY_FORM_MODE.CREATE}/>
    </MainLayout>
  );
}
