import { LightningElement, wire, track } from 'lwc';
import getCertificationList from '@salesforce/apex/CertificationController.getCertificationList';
import getCertification from '@salesforce/apex/CertificationController.getCertification';

//Columns defined to be shown on lightning datatable
const COLS = [
    { label: 'Certification Id', fieldName: 'Cert_Id__c' },
    { label: 'Name', fieldName: 'Name', type: 'text' },
    { label: 'Cost', fieldName: 'Cost__c', type: 'number', cellAttributes: { alignment: 'left' } },
    { label: 'Comments', fieldName: 'Comments__c', type: 'text'},
    { label: 'View', type: 'button-icon', initialWidth: 75,
        typeAttributes: {
            label: 'Show',
            name: 'showRec',
            iconName: 'action:info',
            title: 'Info',
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
    
    //Using the apex method to fetch the list of records in Voucher Object
    @wire(getCertificationList)
    certification;

    //Function used to fetch records according to the value given as input in the searchbar
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

    //Function to handle the action when view icon is pressed
    handleRowAction(event) {

        const row = event.detail.row;

        console.log(JSON.stringify(event.detail.action));
        if(event.detail.action.label==='Show') {
            console.log('clicked View button');
            this.record = row;
            this.openModal();
        }

    }

    //Functions to open and close the view record modal.
    openModal() {  
        this.bShowModal = true;
    }
 
    closeModal() {    
        this.bShowModal = false;
    }
}