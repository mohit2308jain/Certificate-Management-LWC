import { LightningElement, wire, track } from 'lwc';
import getCertificationList from '@salesforce/apex/CertificationController.getCertificationList';
import getCertification from '@salesforce/apex/CertificationController.getCertification';


const COLS = [
    { label: 'Certification Id', fieldName: 'Cert_Id__c' },
    { label: 'Name', fieldName: 'Name', type: 'text' },
    { label: 'Cost', fieldName: 'Cost__c', type: 'number', cellAttributes: { alignment: 'left' } },
    { label: 'Comments', fieldName: 'Comments__c', type: 'text'},
    { label: 'View', type: 'button-icon', initialWidth: 75,
        typeAttributes: {
            label: 'Show',
            name: 'showRec',
            iconName: 'action:preview',
            title: 'Preview',
            variant: 'border-filled',
            alternativeText: 'View'
        }
    }
];

export default class CertificationDetails extends LightningElement {

    @track bShowModal = false;
    @track record = {};
    @track error;
    @track columns = COLS;
    selected = [];

    @track recId;
    @wire(getCertificationList)
    certification;

    searchRecords = (event)  => {

        const searchTerm = event.target.value; 
        
        if (searchTerm) {
            getCertification( { searchTerm } ).then((result) => { 
                
                this.certification.data = result;
            }) 
            .catch(error => { 
                this.error = error; 
            }); 
        } else if(!searchTerm) 
        {
            getCertificationList()
            .then(result => {
                this.certification.data = result;
            })
            .catch(error => {
                this.error = error;
            })
        }
        else{
            this.certification = undefined; 
        }
    }


    handleRowAction(event) {

        const row = event.detail.row;

        console.log(JSON.stringify(event.detail.action));
        if(event.detail.action.label==='Show') {
            console.log('clicked View button');
            this.record = row;
            this.openModal();
        }

    }

    openModal() {  
        this.bShowModal = true;
    }
 
    closeModal() {    
        this.bShowModal = false;
    }
}