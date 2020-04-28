import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createRecord, getRecord } from 'lightning/uiRecordApi';
import { updateRecord } from 'lightning/uiRecordApi';
import { deleteRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import getEmployeeList from '@salesforce/apex/EmployeeController.getEmployeeList';

import Employee_Object from '@salesforce/schema/Employee__c';
import EmployeeRecId from '@salesforce/schema/Employee__c.Id';
import IdField from '@salesforce/schema/Employee__c.Emp_ID__c';
import EmployeeName from '@salesforce/schema/Employee__c.Name';
import EmployeeEmail from '@salesforce/schema/Employee__c.Email__c';
import PrimarySkill from '@salesforce/schema/Employee__c.Primary_Skill__c';
import SecondarySkill from '@salesforce/schema/Employee__c.Secondary_Skill__c';
import EmployeeExperience from '@salesforce/schema/Employee__c.Experience__c';
import EmployeeCompany from '@salesforce/schema/Employee__c.Company_Name__c';
import EmployeeComments from '@salesforce/schema/Employee__c.Comments__c';


const COLS = [
    { label: 'Emp Id', fieldName: 'Emp_ID__c' },
    { label: 'Name', fieldName: 'Name', type: 'text', editable: true },
    { label: 'Email', fieldName: 'Email__c', type: 'email', editable: true },
    { label: 'Primary Skill', fieldName: 'Primary_Skill__c', type: 'text', editable: true },
    { label: 'Secondary Skill', fieldName: 'Secondary_Skill__c', type: 'text', editable: true, cellAttributes: { alignment: 'left' } },
    { label: 'Experience', fieldName: 'Experience__c', type: 'number', editable: true, cellAttributes: { alignment: 'left' } },
    { label: 'Company', fieldName: 'Company_Name__c', type: 'text', editable: true },
    { label: 'Comments', fieldName: 'Comments__c', type: 'text', editable: true },
    { label: 'View', type: 'button-icon', initialWidth: 75,
        typeAttributes: {
            label: 'Show',
            name: 'showRec',
            iconName: 'action:preview',
            title: 'Preview',
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
            alternativeText: 'View'
        }
    }
];

export default class EmployeeDetails extends LightningElement {

    eName = '';
    eEmail = '';
    pskill = '';
    sskill = '';
    eExperience = 0;
    eCompany = '';
    eComments = '';

    handleChanges = (event) => {
        if(event.target.label == 'Name'){
            this.eName = event.target.value;
        }
        else if(event.target.label == 'Company Name'){
            this.eCompany = event.target.value;
        }
        else if(event.target.label == 'Email'){
            this.eEmail = event.target.value;
        }
        else if(event.target.label == 'Primary Skill'){
            this.pskill = event.target.value;
        }
        else if(event.target.label == 'Secondary Skill'){
            this.sskill = event.target.value;
        }
        else if(event.target.label == 'Experience'){
            this.eExperience = event.target.value;
        }
        else if(event.target.label == 'Comments'){
            this.eComments = event.target.value;
        }

    }

    createEmployee = (event) => {
        const fields = {};
        fields[EmployeeName.fieldApiName] = this.eName;
        fields[EmployeeEmail.fieldApiName] = this.eEmail;
        fields[PrimarySkill.fieldApiName] = this.pskill;
        fields[SecondarySkill.fieldApiName] = this.sskill;
        fields[EmployeeExperience.fieldApiName] = this.eExperience;
        fields[EmployeeCompany.fieldApiName] = this.eCompany;
        fields[EmployeeComments.fieldApiName] = this.eComments;
   
        console.log(fields);

        const recordInput = { apiName: Employee_Object.objectApiName, fields };

        createRecord(recordInput).then(() => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Successfully Created',
                message: 'Employee Added',
                variant: 'success'
            }));
            location.reload();
        }).catch(() => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: 'Error in creating record',
                variant: 'error'
            }));
        })
    } 

    clear = (event) => {
        this.template.querySelector('form').reset();
    }

    

    @track bShowModal = false;
    @track record = {};
    @track error;
    @track columns = COLS;
    @track draftValues = [];
    selected = [];

    @track recId;
    @wire(getEmployeeList)
    employee;

    handleRowAction(event) {

        const row = event.detail.row;

        console.log(JSON.stringify(event.detail.action));
        if(event.detail.action.label==='Show') {
            console.log('clicked View button');
            this.record = row;
            this.openModal();
        } else if (event.detail.action.label==='remove') {
            console.log('clicked Delete button');
            this.deleteEmployee(row);
        }

    }

    openModal() {  
        this.bShowModal = true;
    }
 
    closeModal() {    
        this.bShowModal = false;
    }


    handleSave = (event) =>  {

        let fields = {};

        const len = event.detail.draftValues.length;

        for(let i=0;i<len;i++){
            fields = {};

            fields[EmployeeRecId.fieldApiName] = event.detail.draftValues[i].Id;
            fields[EmployeeName.fieldApiName] = event.detail.draftValues[i].Name;
            fields[EmployeeEmail.fieldApiName] = event.detail.draftValues[i].Email__c;
            fields[PrimarySkill.fieldApiName] = event.detail.draftValues[i].Primary_Skill__c;
            fields[SecondarySkill.fieldApiName] = event.detail.draftValues[i].Secondary_Skill__c;
            fields[EmployeeExperience.fieldApiName] = event.detail.draftValues[i].Experience__c;
            fields[EmployeeCompany.fieldApiName] = event.detail.draftValues[i].Company_Name__c;
            fields[EmployeeComments.fieldApiName] = event.detail.draftValues[i].Comments__c;
            console.log(fields);
            
            if(i==(len-1)){
                updateRecord({fields})
                .then(() => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Employee updated',
                            variant: 'Success'
                        })
                    );

                    this.draftValues = [];
                    location.reload();
                    //return refreshApex(this.certification);
                }).catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent ({
                            title: 'Error creating record',
                            message: error.body.message,
                            variant: 'error'
                        })
                    );
                });
            }
            else{
                updateRecord({fields})
            }   
        }
    }

    deleteEmployee = (currRow) => {


        deleteRecord(currRow.Id)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record deleted',
                        variant: 'success'
                    })
                );
                
                return refreshApex(this.employee);
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