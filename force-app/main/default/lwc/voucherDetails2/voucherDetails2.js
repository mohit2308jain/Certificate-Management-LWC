import { LightningElement, wire, track, api } from 'lwc';
import getVoucherList from '@salesforce/apex/VoucherController.getVoucherList';
import getVoucher from '@salesforce/apex/VoucherController.getVoucher';

//Columns defined to be shown on lightning datatable
const COLS = [
    { label: 'Voucher Id', fieldName: 'Voucher_Id__c' },
    { label: 'Name', fieldName: 'Name', type: 'text'},
    { label: 'Cost', fieldName: 'Cost__c', type: 'number', cellAttributes: { alignment: 'left' } },
    { label: 'Validity', fieldName: 'Validity__c', type: 'date'},
    { label: 'Active', fieldName: 'Active__c', type: 'boolean'},
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

export default class VoucherDetails extends LightningElement {
    

    @track bShowModal = false;
    @track record = {};
    @track error;
    @track columns = COLS;
    @track draftValues = [];
    
    //Using the apex method to fetch the list of records in Voucher Object
    @wire(getVoucherList)
    vouchers;

    //Function used to fetch records according to the value given as input in the searchbar
    searchRecords = (event)  => {

        const searchTerm = event.target.value; 
        
        if (searchTerm) {
            getVoucher( { searchTerm } ).then((result) => { 
                
                this.vouchers.data = result;
            }) 
            .catch(error => { 
                this.error = error; 
            }); 
        } else if(!searchTerm) 
        {
            getVoucherList()
            .then(result => {
                this.vouchers.data = result;
            })
            .catch(error => {
                this.error = error;
            })
        }
        else{
            this.vouchers = undefined; 
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