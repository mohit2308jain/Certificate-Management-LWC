trigger Check_Existing_Employees on Certification_Request__c (before insert) {
    if ( Trigger.isInsert ) {
            for ( Certification_Request__c obj : Trigger.new ) {
                List<Certification_Request__c> reqList = [SELECT Certification__c, Employee__c, Status__c FROM Certification_Request__c WHERE Employee__c=:obj.Employee__c];
                if(!reqList.isEmpty()){
                    for( Certification_Request__c i : reqList ){
                        if((obj.Certification__c == i.Certification__c) && (i.Status__c == 'Draft' || i.Status__c == 'Approved' || i.Status__c == 'Rejected' || i.Status__c == 'Passed' || i.Status__c == 'Failed')){
                            obj.Employee__c.addError(' Certification Request for this Certification from this Employee already exists !');
                            break;
                        }
                        else if(i.Status__c == 'Draft' && obj.Certification__c != i.Certification__c){
                            obj.Employee__c.addError('A Pending Certification Request for this Employee already exists !');
                            break;
                        }
                        else{ continue; }
                    }
                }
            }
    }
}