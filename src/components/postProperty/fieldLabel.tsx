export default function FieldLabel({label, customClass = '', required = false}: {label: string,required?: boolean, customClass?: string}){
    return(
        <p className={`text-text-black font-medium text-sm ${required ? 'required-label' : ''} ${customClass}`}>{label}</p>
    )
}