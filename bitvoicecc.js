// BitVoice Event Handler
window.BitvoiceCCF = {
    // Store active calls
    activeCalls: new Map(),

    // Event types
    EVENT_TYPES: {
        INBOUND_CALL: 'INBOUND_CALL',
        OUTBOUND_CALL: 'OUTBOUND_CALL',
        HANGUP: 'HANGUP',
        AGENT_LOGIN: 'AGENT_LOGIN',
        MISSEDCALL: 'MISSEDCALL'
    },


    /**
     * Process incoming events and route to BitvoiceCC
     * @param {Object} eventData - Raw event data
     */
    async handleEvent(eventData) {
        const { Event: eventType, Data: data } = eventData;

        // Only process event if it's one we handle
        if (!Object.values(this.EVENT_TYPES).includes(eventType)) {
            console.log(`Unhandled event type: ${eventType}`);
            return;
        }

        try {
            switch (eventType) {
                case this.EVENT_TYPES.INBOUND_CALL:
                    await this.handleInboundCall(eventData);
                    break;
                case this.EVENT_TYPES.OUTBOUND_CALL:
                    await this.handleOutboundCall(eventData);
                    break;
                case this.EVENT_TYPES.HANGUP:
                    await this.handleHangup(eventData);
                    break;
                case this.EVENT_TYPES.AGENT_LOGIN:
                    await this.handleAgentLogin(eventData);
                    break;
                case this.EVENT_TYPES.MISSEDCALL:
                    await this.handleMissedCall(eventData);
                    break;
            }
        } catch (error) {
            console.error('Error handling event:', error);
        }
    },

    async handleOutboundCall(eventData) {
        const { Data: data } = eventData;
        const callId = data.uniqueid;

        // Store call information
        this.activeCalls.set(callId, {
            startTime: new Date(),
            data: data
        });


        await processIncomingEvent(eventData);
    },

    /**
     * Handle inbound calls
     * @param {Object} eventData - Complete event data
     */
    async handleInboundCall(eventData) {
        const { Data: data } = eventData;
        const callId = data.uniqueid;

        // Store call information
        this.activeCalls.set(callId, {
            startTime: new Date(),
            data: data
        });

        //Show popup
        await processIncomingEvent(eventData);
    },

    /**
     * Handle call hangups
     * @param {Object} eventData - Complete event data
     */
    async handleHangup(eventData) {
        console.log('Hangup event:', eventData.Data);
        console.log('Active calls:', this.activeCalls);
        const data = eventData.Data;
        const callId = data.uniqueid;

        if (this.activeCalls.has(callId)) {
            const callData = this.activeCalls.get(callId);
            // Calculate call duration
            const duration = new Date() - callData.startTime;

            // Add duration to event data
            data.duration = duration;

            // Create call entity in CRM
            try {
                await this.createCallEntity(data);
            } catch (error) {
                console.error('Error in handleHangup while creating call entity:', error);
            }

            // Clean up call data
            this.activeCalls.delete(callId);
        }
    },

    /**
     * Handle agent login events
     * @param {Object} eventData - Complete event data
     */
    async handleAgentLogin(eventData) {
        // Process agent login event

    },

    /**
     * Handle missed calls
     * @param {Object} eventData - Complete event data
     */
    async handleMissedCall(eventData) {
        // Process missed call event

    },

    /*
    * Gets the parent entity from current URL or related records
    * @returns {Promise<{entityType: string, entityId: string}|null>}
    */
    async getParentEntity() {
        // 1. Try to get from URL first
        const hash = window.location.hash;
        const urlMatch = hash.match(/#([^/]+)\/view\/([^/]+)/);
        if (urlMatch) {
            return {
                entityType: urlMatch[1],
                entityId: urlMatch[2]
            };
        }

        return null;
    },

    /**
     * Creates a call entity in EspoCRM using the provided call data.
     *
     * @async
     * @function createCallEntity
     * @param {Object} callData - The data related to the call.
     * @param {string} callData.cid_name - The caller ID name.
     * @param {string} callData.cid_num - The caller ID number.
     * @param {string} callData.calldirection - The direction of the call ('INBOUND_CALL' or 'OUTBOUND_CALL').
     * @param {number} callData.eventtime - The timestamp of the call event.
     * @param {number} callData.duration - The duration of the call in milliseconds.
     * @param {string} callData.from - The phone number of the caller.
     * @param {string} callData.to - The phone number of the recipient.
     * @param {string} callData.agent - The agent handling the call.
     * @param {string} callData.uniqueid - The unique identifier for the call.
     * @throws {Error} If Espo is not initialized or if there is an error creating the call entity.
     * @returns {Promise<Object>} The created call entity.
     */
    async createCallEntity(callData) {
        if (!window.Espo || !window.Espo.Ajax) {
            throw new Error("BitvoiceCC: Espo not initialized");
        }

        // Get current user data
        let userData = null;
        try {
            const response = await window.Espo.Ajax.getRequest('App/user');
            userData = response.user;
        } catch (error) {
            console.warn('Could not fetch current user data:', error);
        }

        const parentEntity = await this.getParentEntity();

        // Format dates for Espo
        const startDate = new Date(callData.eventtime);
        const endDate = new Date(startDate.getTime() + callData.duration);

        // Format to YYYY-MM-DD HH:mm:ss
        const formatDate = (date) => {
            return date.getFullYear() + '-' +
                String(date.getMonth() + 1).padStart(2, '0') + '-' +
                String(date.getDate()).padStart(2, '0') + ' ' +
                String(date.getHours()).padStart(2, '0') + ':' +
                String(date.getMinutes()).padStart(2, '0') + ':' +
                String(date.getSeconds()).padStart(2, '0');
        };

        let durationinseconds = Math.round(callData.duration / 1000);
        // EspoCRM Need duration in Minutes so converting seconds to minutes if less than 60 seconds then 1 minute
        let durationinminutes = 0;
        if (durationinseconds < 60 && durationinseconds > 0) {
            durationinminutes = 1;
        } else {
            durationinminutes = Math.round(durationinseconds / 60);
        }

        const payload = {
            name: `Call with ${callData.cid_name || callData.cid_num}`,
            status: 'Held',
            direction: callData.calldirection === 'INBOUND_CALL' ? 'Inbound' : 'Outbound',
            dateStart: formatDate(startDate),
            dateEnd: formatDate(endDate),
            duration: durationinminutes,
            description: `Call ${callData.calldirection}\nFrom: ${callData.from}\nTo: ${callData.to}\nAgent: ${callData.agent}`,
            phoneNumber: callData.from,
            callId: callData.uniqueid
        };

        // Add parent entity if available
        if (parentEntity) {
            payload.parentType = parentEntity.entityType;
            payload.parentId = parentEntity.entityId;
        }



        // Set user assignment and team data from current user
        if (userData) {
            payload.assignedUserId = userData.id;
            if (userData.teamsIds && userData.teamsIds.length > 0) {
                payload.teamsIds = userData.teamsIds;
            }
            if (userData.defaultTeamId) {
                payload.defaultTeamId = userData.defaultTeamId;
            }
        }

        try {
            // First search for contact using phone number
            const contacts = await window.Espo.Ajax.getRequest(
                `Contact?maxSize=1&where[0][attribute]=phoneNumber&where[0][type]=equals&where[0][value]=${encodePhoneNumberForApi(callData.from)}`
            );

            if (contacts.list.length > 0) {
                payload.contactId = contacts.list[0].id;
                payload.contactName = contacts.list[0].name;
            }

            // Create the call entity
            const newCall = await window.Espo.Ajax.postRequest('Call', payload);
            console.log('Call entity created:', newCall);
            return newCall;
        } catch (error) {
            console.error('Error creating call entity:', error);
            throw error;
        }
    },

};




async function processIncomingEvent(eventData) {

    const DEFAULT_CONFIG = {
        salutation: 'Mr.',
        stage: 'Prospecting',
        maxResults: 1
    };
    if (!window.Espo || !window.Espo.Ajax) {
        console.error("BitvoiceCC: Espo not initialized");
        return;
    }

    const phoneNumber = eventData.Data?.phoneNumber;
    if (!phoneNumber) {
        console.error("BitvoiceCC: Missing required phoneNumber");
        return;
    }

    // the phoneNumber may be in the format 9447111230 or +919447111230 or 00919447111230 if the number is >= 10 digits
    // always set the number in INTERNATIONAL format like +919447111230
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    if (!formattedPhoneNumber) {
        console.error("BitvoiceCC: Invalid phone number");
        return;
    }

    //Opertuinty From
    const showEnquiryModal = (existingContact = null) => {

        const modalHtml = `
            <div class="modal fade" id="enquiryModal" tabindex="-1" role="dialog">
                <div class="modal-dialog modal-lg" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4 class="modal-title">
                                <span class="fas fa-plus"></span>
                                Create Enquiry
                            </h4>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <form id="enquiryForm" class="record">
                                <div class="record-grid">
                                    <div class="panel panel-default">
                                        <div class="panel-body">
                                            <!-- Name Section -->
                                            <div class="cell form-group" data-name="name">
                                                <label class="control-label" data-name="name">
                                                    Name
                                                    <span class="required-sign">*</span>
                                                </label>
                                                <div class="field" data-name="name">
                                                    <div class="row">
                                                        <div class="col-sm-2">
                                                            <select class="form-control main-element" name="salutationName">
                                                                <option value="Mr.">Mr.</option>
                                                                <option value="Mrs.">Mrs.</option>
                                                                <option value="Ms.">Ms.</option>
                                                                <option value="Dr.">Dr.</option>
                                                            </select>
                                                        </div>
                                                        <div class="col-sm-5">
                                                            <input type="text" class="form-control main-element" name="firstName" placeholder="First Name" required maxlength="100">
                                                        </div>
                                                        <div class="col-sm-5">
                                                            <input type="text" class="form-control main-element" name="lastName" placeholder="Last Name" required maxlength="100">
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <!-- Phone -->
                                            <div class="cell form-group" data-name="phone">
                                                <label class="control-label" data-name="phone">Phone</label>
                                                <div class="field" data-name="phone">
                                                    <input type="tel" class="form-control main-element" name="phoneNumber" value="${formattedPhoneNumber}" readonly>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="saveEnquiry">Save</button>
                        </div>
                    </div>
                </div>
            </div>`;

        // Add modal to document
        const modalElement = $(modalHtml).appendTo('body');
        // Show modal
        modalElement.modal('show');

        // Handle form submission
        $('#saveEnquiry').on('click', async function () {
            const form = document.getElementById('enquiryForm');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const formData = new FormData(form);

            const payload = {
                stage: DEFAULT_CONFIG.stage,
                salutationName: formData.get('salutationName') || DEFAULT_CONFIG.salutation,
                ...Object.fromEntries(formData),
                name: `${formData.get('firstName')} ${formData.get('lastName')}`
            };

            if (existingContact?.id) {
                payload.contactId = existingContact.id;
            }

            const button = $(this);
            button.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Saving...');
            try {
                const newOpportunity = await Espo.Ajax.postRequest('Opportunity', payload);
                modalElement.modal('hide');
                window.location.hash = `#Opportunity/view/${newOpportunity.id}`;
            } catch (error) {
                console.error('Error creating opportunity:', error);
                Espo.Ui.error('Error creating opportunity. Please try again.');
            } finally {
                button.prop('disabled', false).text('Save');
            }
        });

        // Clean up on modal close
        modalElement.on('hidden.bs.modal', function () {
            modalElement.remove();
        });

        // Pre-fill data if contact exists
        if (existingContact) {
            Object.entries(existingContact).forEach(([key, value]) => {
                const input = modalElement.find(`[name="${key}"]`);
                if (input.length) {
                    input.val(value);
                }
            });
        }
    };

    //Lead From



    const showLeadModal = (existingContact = null) => {
        const modalHtml = `
            <div class="modal fade" id="leadModal" tabindex="-1" role="dialog">
                <div class="modal-dialog modal-lg" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4 class="modal-title">
                                <span class="fas fa-user-plus"></span>
                                Create Lead
                            </h4>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <form id="leadForm" class="record">
                                <div class="record-grid">
                                    <div class="panel panel-default">
                                        <div class="panel-body">
                                            <!-- Name Section -->
                                            <div class="cell form-group" data-name="name">
                                                <label class="control-label" data-name="name">
                                                    Name
                                                    <span class="required-sign">*</span>
                                                </label>
                                                <div class="field" data-name="name">
                                                    <div class="row">
                                                        <div class="col-sm-2">
                                                            <select class="form-control main-element" name="salutationName">
                                                                <option value="Mr.">Mr.</option>
                                                                <option value="Mrs.">Mrs.</option>
                                                                <option value="Ms.">Ms.</option>
                                                                <option value="Dr.">Dr.</option>
                                                            </select>
                                                        </div>
                                                        <div class="col-sm-5">
                                                            <input type="text" class="form-control main-element" name="firstName" placeholder="First Name" required maxlength="100">
                                                        </div>
                                                        <div class="col-sm-5">
                                                            <input type="text" class="form-control main-element" name="lastName" placeholder="Last Name" required maxlength="100">
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <!-- Phone -->
                                            <div class="cell form-group" data-name="phone">
                                                <label class="control-label" data-name="phone">Phone</label>
                                                <div class="field" data-name="phone">
                                                    <input type="tel" class="form-control main-element" name="phoneNumber" value="${formattedPhoneNumber}" readonly>
                                                </div>
                                            </div>

                                            <!-- Email -->
                                            <div class="cell form-group" data-name="email">
                                                <label class="control-label" data-name="email">Email</label>
                                                <div class="field" data-name="email">
                                                    <input type="email" class="form-control main-element" name="emailAddress" placeholder="Email Address">
                                                </div>
                                            </div>

                                            <!-- Status -->
                                            <div class="cell form-group" data-name="status">
                                                <label class="control-label" data-name="status">
                                                    Status
                                                    <span class="required-sign">*</span>
                                                </label>
                                                <div class="field" data-name="status">
                                                    <select class="form-control main-element" name="status" required>
                                                        <option value="New">New</option>
                                                        <option value="Assigned">Assigned</option>
                                                        <option value="In Process">In Process</option>
                                                        <option value="Converted">Converted</option>
                                                        <option value="Recycled">Recycled</option>
                                                        <option value="Dead">Dead</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <!-- Source -->
                                            <div class="cell form-group" data-name="source">
                                                <label class="control-label" data-name="source">Source</label>
                                                <div class="field" data-name="source">
                                                    <select class="form-control main-element" name="source">
                                                        <option value="Phone">Phone</option>
                        
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="saveLead">Save</button>
                        </div>
                    </div>
                </div>
            </div>`;

        // Add modal to document
        const modalElement = $(modalHtml).appendTo('body');
        // Show modal
        modalElement.modal('show');

        // Handle form submission
        $('#saveLead').on('click', async function () {
            const form = document.getElementById('leadForm');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const formData = new FormData(form);

            const payload = {
                status: formData.get('status') || "New",
                source: formData.get('source') || "Phone",
                salutationName: formData.get('salutationName') || "Mr.",
                ...Object.fromEntries(formData),
                name: `${formData.get('firstName')} ${formData.get('lastName')}`
            };

            const button = $(this);
            button.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Saving...');

            try {
                const newLead = await Espo.Ajax.postRequest('Lead', payload);
                modalElement.modal('hide');
                window.location.hash = `#Lead/view/${newLead.id}`;
            } catch (error) {
                console.error('Error creating lead:', error);
                Espo.Ui.error('Error creating lead. Please try again.');
            } finally {
                button.prop('disabled', false).text('Save');
            }
        });

        // Clean up on modal close
        modalElement.on('hidden.bs.modal', function () {
            modalElement.remove();
        });

        // Pre-fill data if contact exists
        if (existingContact) {
            Object.entries(existingContact).forEach(([key, value]) => {
                const input = modalElement.find(`[name="${key}"]`);
                if (input.length) {
                    input.val(value);
                }
            });
        }
    };









    try {


        // 0. Search for existing Leads
        const leads = await Espo.Ajax.getRequest(
            `Lead?maxSize=1&where[0][attribute]=phoneNumber&where[0][type]=equals&where[0][value]=${encodePhoneNumberForApi(phoneNumber)}`
        );
        if (leads.list.length > 0) {
            window.location.hash = `#Lead/view/${leads.list[0].id}`;
            return;
        }

        // 1. First search direct Opportunities
        const directOpps = await Espo.Ajax.getRequest(
            `Opportunity?maxSize=1&where[0][attribute]=phoneNumber&where[0][type]=equals&where[0][value]=${encodePhoneNumberForApi(phoneNumber)}`
        );

        if (directOpps.list.length > 0) {
            window.location.hash = `#Opportunity/view/${directOpps.list[0].id}`;
            return;
        }

        // 2. Search Contacts
        const contacts = await Espo.Ajax.getRequest(
            `Contact?maxSize=1&where[0][attribute]=phoneNumber&where[0][type]=equals&where[0][value]=${encodePhoneNumberForApi(phoneNumber)}`
        );

        let contactId = null;
        let linkedOppId = null;

        if (contacts.list.length > 0) {
            contactId = contacts.list[0].id;
            // 3. Search linked Opportunities
            const linkedOpps = await Espo.Ajax.getRequest(
                `Opportunity?maxSize=1&where[0][attribute]=contactId&where[0][type]=equals&where[0][value]=${contactId}`
            );
            if (linkedOpps.list.length > 0) {
                linkedOppId = linkedOpps.list[0].id;
            }
        }

        if (linkedOppId) {
            window.location.hash = `#Opportunity/view/${linkedOppId}`;
            return;
        }

        //showEnquiryModal(contactId);
        showLeadModal(contactId);

    } catch (error) {
        console.error('BitvoiceCC Error:', error);
        // Fallback to create page with parameters
        const params = new URLSearchParams({
            phoneNumber: phoneNumber,
            contactId: contactId || ''
        });
        window.location.hash = `#Opportunity/create?${params.toString()}`;
    }

}







function formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) {
        console.error("BitvoiceCC: Missing required phoneNumber");
        return null;
    }

    // Remove any non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');

    // Handle different formats
    if (digits.length < 10) {
        console.error("BitvoiceCC: Invalid phone number length");
        return null;
    }

    // If number starts with '00', replace with '+'
    if (digits.startsWith('00')) {
        return '+' + digits.slice(2);
    }

    // If number is exactly 10 digits or starts with a single '0' followed by 9 digits
    if (digits.length === 10 || (digits.length === 11 && digits.startsWith('0'))) {
        // If it starts with '0', remove it before adding the country code
        const baseNumber = digits.startsWith('0') ? digits.slice(1) : digits;
        return '+91' + baseNumber;
    }

    // If number already has country code (length > 10 and doesn't start with '00')
    if (digits.length > 10) {
        // If it doesn't start with '+', add it
        return digits.startsWith('+') ? digits : '+' + digits;
    }

    return null;
}


function encodePhoneNumberForApi(phoneNumber) {
    const formatted = formatPhoneNumber(phoneNumber);
    if (!formatted) {
        throw new Error('Invalid phone number format');
    }
    return encodeURIComponent(formatted);
}



window.BitvoiceCC = function (data) {
    window.BitvoiceCCF.handleEvent(data);
}
//another name for BitvoiceCC is BitvoiceCCAPI
window.BitvoiceCCAPI = window.BitvoiceCC;

// Test

window.BitvoiceCC({
    Event: 'INBOUND_CALL',
    Data: {
        phoneNumber: '9447111231',
        uniqueid: '1738236718.6553'
    }
});



window.BitvoiceCC({
    Event: 'HANGUP',
    Data: {

        "groupname": "Anil",
        "formurl": "",
        "campaign": "2",
        "logid": "1021",
        "from": "09746010990",
        "to": "00914842881781",
        "group_id": "2",
        "status": "1",
        "toext": "500",
        "srcinb": "SIP/bsnl-00000f02",
        "dstinb": "",
        "id": "44698",
        "eventtype": "ANSWER",
        "eventtime": "2025-01-30 17:01:58",
        "cid_name": "Anil Sir Bitvoice",
        "cid_num": "09746010990",
        "cid_ani": "09746010990",
        "cid_rdnis": "",
        "cid_dnid": "00914842881781",
        "exten": "00914842881781",
        "context": "phones",
        "channame": "SIP/bsnl-00000f02",
        "appname": "AGI",
        "appdata": "inbound.php",
        "amaflags": "3",
        "accountcode": "",
        "uniqueid": "1738236718.6553",
        "linkedid": "1738236718.6553",
        "peer": "",
        "userdeftype": "",
        "extra": "",
        "agentstatus": "AVAILABLE",
        "agent": "anil",
        "agid": "5",
        "calldirection": "INBOUND_CALL"

    }
});
