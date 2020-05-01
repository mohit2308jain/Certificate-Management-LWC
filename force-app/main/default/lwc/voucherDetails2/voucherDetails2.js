import { LightningElement, wire, track, api } from 'lwc';
import getVoucherList from '@salesforce/apex/VoucherController.getVoucherList';
import getVoucher from '@salesforce/apex/VoucherController.getVoucher';

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
            iconName: 'action:preview',
            title: 'Preview',
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
    
    @wire(getVoucherList)
    vouchers;

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