import UserKyc from "@/components/kyc";
import MainLayout from "@/components/kyc/mainLayout";

export default async function Kyc({ searchParams }){
    const searchParameter = await searchParams;
    const {tabName, event} = searchParameter;

    return(
        <MainLayout>
            <UserKyc tabName={tabName} event={event}/>
        </MainLayout>
    )
}