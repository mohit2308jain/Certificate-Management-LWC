trigger Check_Existing_Employees on Certification_Request__c (before insert) {
if ( Trigger.isInsert ) {
        for ( Certification_Request__c obj : Trigger.new ) {
            List<Certification_Request__c> apk = [SELECT Certification__c, Employee__c, Status__c FROM Certification_Request__c WHERE Employee__c=:obj.Employee__c];
            if ( apk.size() > 0 && ((apk[0].Status__c == 'Draft' || apk[0].Status__c == 'Approved' || apk[0].Status__c == 'Passed' || apk[0].Status__c == 'Failed') && apk[0].Certification__c == obj.Certification__c)) {
                obj.Employee__c.addError(' Certification Request for this Employee already exists !');
            } else { break; }
        }
    }
}