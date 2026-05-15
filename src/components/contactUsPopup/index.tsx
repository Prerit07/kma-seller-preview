import { useState } from "react";
import ChannelPartnerContact from "../contactInformation/channelPartnerContact";

export default function ContactUsPopup({open, onClose}){
    
    const closeContactPopup = () => {
        onClose()
    }
    return(
        <div>
            <ChannelPartnerContact open={open} onClose={closeContactPopup}/>
        </div>
    )
}