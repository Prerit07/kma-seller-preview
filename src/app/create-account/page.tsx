import MainLayout from "@/components/signUp/mainLayout";
import ContentLayout from "@/components/signUp/contentLayout";
import InfoSection from "@/components/signUp/infoSection";
import CreateAccount from "@/components/signUp/createAccount";

export default function CreateAccountPage() {
  return (
    <MainLayout>
      <ContentLayout
        cardContent={<CreateAccount step={1} />}
        infoContent={
          <InfoSection
            titlePrefix="Experience a Better Way to List & Sell"
            title=""
          />
        }
      />
    </MainLayout>
  );
}
