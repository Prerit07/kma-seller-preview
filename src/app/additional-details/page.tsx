import MainLayout from "@/components/signUp/mainLayout";
import ContentLayout from "@/components/signUp/contentLayout";
import InfoSection from "@/components/signUp/infoSection";
import CreateAccount from "@/components/signUp/createAccount";

export default function AdditionalDetailsPage() {
  return (
    <MainLayout>
      <ContentLayout
        cardContent={<CreateAccount step={2} />}
        infoContent={
          <InfoSection
            titlePrefix="Complete Your Partner Profile"
            title=""
          />
        }
      />
    </MainLayout>
  );
}
