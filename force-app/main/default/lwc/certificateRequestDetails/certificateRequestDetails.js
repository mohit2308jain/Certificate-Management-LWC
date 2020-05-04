import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createRecord, getRecord } from 'lightning/uiRecordApi';
import { updateRecord } from 'lightning/uiRecordApi';
import { deleteRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import getRequestsList from '@salesforce/apex/RequestController.getRequestsList';
import getRequest from '@salesforce/apex/RequestController.getRequest';

//Importing all neccessary fields from Certification Request Object.
import Certification_Request_Object from '@salesforce/schema/Certification_Request__c';
import CertificationReqRecId from '@salesforce/schema/Certification_Request__c.Id';
import CertificationReqStatus from '@salesforce/schema/Certification_Request__c.Status__c';
import CertificationReqDueDate from '@salesforce/schema/Certification_Request__c.Due_Date__c';
import CertificationReqVoucher from '@salesforce/schema/Certification_Request__c.Voucher__c';
import CertificationReqCertification from '@salesforce/schema/Certification_Request__c.Certification__c';
import CertificationReqComments from '@salesforce/schema/Certification_Request__c.Comments__c';
import CertificationReqEmployee from '@salesforce/schema/Certification_Request__c.Employee__c';

//Columns defined to be shown on lightning datatable
const COLS = [
    { label: 'Req Id', fieldName: 'Name' },
    { label: 'Certification', fieldName: 'Certification__c'},
    { label: 'Employee', fieldName: 'Employee__c' },
    { label: 'Status', fieldName: 'Status__c' },
    { label: 'View', type: 'button-icon', initialWidth: 75,
        typeAttributes: {
            label: 'Show',
            name: 'showRec',
            iconName: 'action:info',
            title: 'Info',
            variant: 'border-filled',
            alternativeText: 'View'
        }
    },
    { label: 'Delete', type: 'button-icon', initialWidth: 75,
        typeAttributes: {
            label: 'remove',
            name: 'delRec',
            iconName: 'action:delete',
            title: 'Delete',
            variant: 'border-filled',
            alternativeText: 'Delete'
        }
    },
    { label: 'Passed', type: 'button-icon', initialWidth: 75,
        typeAttributes: {
            label: 'ChangeToPassed',
            name: 'passedRec',
            iconName: 'action:approval',
            title: 'Passed',
            variant: 'border-filled',
            alternativeText: 'Passed'
        }
    },
    {  type: 'button-icon', initialWidth: 75,
        typeAttributes: {
            label: 'ChangeToFailed',
            name: 'failedRec',
            iconName: 'action:reject',
            title: 'Failed',
            variant: 'border-filled',
            alternativeText: 'Failed'
        }
    }
];

export default class CertificateRequestDetails extends LightningElement {

    certification_field = CertificationReqCertification;
    employee_field = CertificationReqEmployee;
    voucher_field = CertificationReqVoucher;
    dueDate_field = CertificationReqDueDate;
    comments_field = CertificationReqComments;

    //Inserting record in the salesforce database
    createRequest = (event) => {
        this.dispatchEvent(new ShowToastEvent({
            title: 'Success',
            message: 'Request Created !',
            variant: 'success'
        }));
        location.reload();
    }

    clear = (event) => {
        this.template.querySelector('form').reset();
    }

    @track showCreateForm = false;
    @track showList = true;
    @track bShowModal = false;
    @track record = {};
    @track error;
    @track columns = COLS;
    @track draftValues = [];
    @track requests;
    req;

    //Using the apex method to fetch the list of records in Certification Request Object
    @wire(getRequestsList)
    Certification_Request__c(result) {
        this.req = result;
        if (result.data) {
            this.handleDataToShow(result.data);
            this.error = undefined;
        } else if (result.error) {
            this.requests = undefined;
            this.error = result.error;
        }
    }

    //Function to customize the data to be shown on the lightning datatable
    handleDataToShow = (result) => {
        let dataToShow = [];
            result.forEach((res) => {
                let show = {};
                show.Id = res.Id;
                show.Name = res.Name;
                show.Certification__c = res.Certification__r.Name;
                show.Employee__c = res.Employee__r.Name;
                if(res.Voucher__r != null){
                    show.Voucher__c = res.Voucher__r.Name;
                }
                else{
                    show.Voucher__c = '';
                }
                show.Due_Date__c = res.Due_Date__c;
                show.Status__c = res.Status__c;
                show.Comments__c = res.Comments__c;
                dataToShow.push(show);
            });
            this.requests = dataToShow;
    }

    //Function used to fetch records according to the value given as input in the searchbar
    searchRecords = (event) => { 
        
        const searchTerm = event.target.value; 
        console.log(searchTerm);
        if(searchTerm){
            
            getRequest( { searchTerm } ).then((result) => {
                
                this.handleDataToShow(result);
            }) 
            .catch(error => { 
                this.error = error; 
            }); 
        } 
        else if(!searchTerm) 
        {
            getRequestsList()
            .then(result => {
                this.handleDataToShow(result);
            }) 
            .catch(error => {
                this.error = error;
            })
        }
        else{
            this.requests = undefined; 
        }
    }

    //Functions to show create record form and the list of records on button clicks
    showFormView = (event) => {
        this.showCreateForm = true;
        this.showList = false;
    }
    showListView = (event) => {
        this.showList = true;
        this.showCreateForm = false;
    }


    //Function to handle the action when view, delete, passed icons are pressed
    handleRowAction(event) {

        const row = event.detail.row;

        console.log(JSON.stringify(event.detail.action));
        if(event.detail.action.label==='Show') {
            console.log('clicked View button');
            this.record = row;
            console.log(this.requests);
            this.openModal();
        } else if (event.detail.action.label==='remove') {
            console.log('clicked Delete button');
            this.deleteRequests(row);
        } else if(event.detail.action.label==='ChangeToPassed'){
            this.updateStatus(row,'Passed');
        } else if(event.detail.action.label==='ChangeToFailed'){
            this.updateStatus(row,'Failed');
        }

    }

    //Functions to open and close the view record modal.
    openModal() {  
        this.bShowModal = true;
    }
    closeModal() {    
        this.bShowModal = false;
    }

    //Function to update the status of request to passed or failed
    updateStatus = (currRow, status) => {
        const fields = {}
        console.log("hhj")
        fields[CertificationReqRecId.fieldApiName] = currRow.Id;
        fields[CertificationReqStatus.fieldApiName] = status;
         
        const recordInput = {fields};
        updateRecord(recordInput).then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Status Updated to ' + status,
                    variant: 'success'
                })
            );
            return refreshApex(this.req);
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Error occured in updating status',
                    variant: 'error'
                })
            );
        })
    }


    //Function to delete a particular record when that corresponding record's delete icon is pressed
    deleteRequests = (currRow) => {

        deleteRecord(currRow.Id)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record deleted',
                        variant: 'success'
                    })
                );
                
                return refreshApex(this.req);
                location.reload();
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting record',
                        message: 'Cannot Delete',
                        variant: 'error'
                    })
                );
            });
            

        console.log('delete');
    }

}