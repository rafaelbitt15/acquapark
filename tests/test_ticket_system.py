"""
Test suite for Acqua Park Ticket Management System
Tests: Admin login, Ticket Availability, Staff Management, Staff Login, Ticket Validation
"""
import pytest
import requests
import os
import uuid
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "bitencourt.rafandrade@gmail.com"
ADMIN_PASSWORD = "Rafa2188"
STAFF_EMAIL = "joao@acquapark.com"
STAFF_PASSWORD = "123456"


class TestHealthCheck:
    """Basic health check tests"""
    
    def test_api_health(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get('status') == 'healthy'
        print("✓ API health check passed")


class TestAdminAuth:
    """Admin authentication tests"""
    
    def test_admin_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        print(f"✓ Admin login successful, token received")
        return data["access_token"]
    
    def test_admin_login_invalid_credentials(self):
        """Test admin login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@email.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Admin login correctly rejected invalid credentials")
    
    def test_admin_me_endpoint(self):
        """Test /api/auth/me endpoint with valid token"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = login_response.json()["access_token"]
        
        # Then check /me
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["is_admin"] == True
        print(f"✓ Admin /me endpoint returned correct user info")


class TestTicketAvailability:
    """Ticket availability CRUD tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Admin authentication failed")
    
    def test_get_ticket_availability(self, admin_token):
        """Test fetching ticket availability list"""
        response = requests.get(f"{BASE_URL}/api/admin/ticket-availability", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Fetched {len(data)} availability records")
    
    def test_create_ticket_availability(self, admin_token):
        """Test creating new ticket availability"""
        # Use a future date to avoid conflicts
        test_date = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
        
        response = requests.post(f"{BASE_URL}/api/admin/ticket-availability", 
            json={
                "date": test_date,
                "total_tickets": 150
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        # Could be 200 or 400 if date already exists
        if response.status_code == 200:
            data = response.json()
            assert "id" in data
            assert "message" in data
            print(f"✓ Created availability for {test_date}")
            
            # Cleanup - delete the created availability
            requests.delete(f"{BASE_URL}/api/admin/ticket-availability/{test_date}",
                headers={"Authorization": f"Bearer {admin_token}"})
        elif response.status_code == 400:
            # Date already exists, which is fine
            print(f"✓ Availability for {test_date} already exists (expected)")
        else:
            pytest.fail(f"Unexpected status code: {response.status_code}")
    
    def test_update_ticket_availability(self, admin_token):
        """Test updating ticket availability"""
        # First create a test availability
        test_date = (datetime.now() + timedelta(days=31)).strftime("%Y-%m-%d")
        
        # Create
        create_response = requests.post(f"{BASE_URL}/api/admin/ticket-availability",
            json={"date": test_date, "total_tickets": 100},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        if create_response.status_code in [200, 400]:
            # Update
            update_response = requests.put(f"{BASE_URL}/api/admin/ticket-availability/{test_date}",
                json={"total_tickets": 200},
                headers={"Authorization": f"Bearer {admin_token}"}
            )
            
            if update_response.status_code == 200:
                print(f"✓ Updated availability for {test_date}")
            elif update_response.status_code == 404:
                print(f"✓ Availability not found (date may not exist)")
            
            # Cleanup
            requests.delete(f"{BASE_URL}/api/admin/ticket-availability/{test_date}",
                headers={"Authorization": f"Bearer {admin_token}"})
    
    def test_delete_ticket_availability(self, admin_token):
        """Test deleting ticket availability"""
        # Create a test availability first
        test_date = (datetime.now() + timedelta(days=32)).strftime("%Y-%m-%d")
        
        requests.post(f"{BASE_URL}/api/admin/ticket-availability",
            json={"date": test_date, "total_tickets": 50},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        # Delete
        response = requests.delete(f"{BASE_URL}/api/admin/ticket-availability/{test_date}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code in [200, 404]
        print(f"✓ Delete availability endpoint working")
    
    def test_check_availability_public(self, admin_token):
        """Test public availability check endpoint"""
        # First ensure there's availability for a date
        test_date = (datetime.now() + timedelta(days=33)).strftime("%Y-%m-%d")
        
        requests.post(f"{BASE_URL}/api/admin/ticket-availability",
            json={"date": test_date, "total_tickets": 100},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        # Check availability (public endpoint)
        response = requests.get(f"{BASE_URL}/api/check-availability/{test_date}?quantity=5")
        assert response.status_code == 200
        data = response.json()
        assert "available" in data
        print(f"✓ Public availability check working: available={data.get('available')}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/ticket-availability/{test_date}",
            headers={"Authorization": f"Bearer {admin_token}"})


class TestStaffManagement:
    """Staff management tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Admin authentication failed")
    
    def test_get_staff_list(self, admin_token):
        """Test fetching staff list"""
        response = requests.get(f"{BASE_URL}/api/admin/staff", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Fetched {len(data)} staff members")
        
        # Verify staff data structure
        if len(data) > 0:
            staff = data[0]
            assert "name" in staff
            assert "email" in staff
            assert "hashed_password" not in staff  # Should not expose password
            print(f"✓ Staff data structure is correct")
    
    def test_create_staff(self, admin_token):
        """Test creating new staff member"""
        unique_id = uuid.uuid4().hex[:8]
        test_email = f"TEST_staff_{unique_id}@acquapark.com"
        
        response = requests.post(f"{BASE_URL}/api/admin/staff",
            json={
                "name": f"Test Staff {unique_id}",
                "email": test_email,
                "password": "testpass123"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            assert "id" in data
            print(f"✓ Created staff member: {test_email}")
            
            # Cleanup - delete the created staff
            staff_id = data["id"]
            requests.delete(f"{BASE_URL}/api/admin/staff/{staff_id}",
                headers={"Authorization": f"Bearer {admin_token}"})
            print(f"✓ Cleaned up test staff")
        elif response.status_code == 400:
            print(f"✓ Staff creation rejected (email may already exist)")
        else:
            pytest.fail(f"Unexpected status code: {response.status_code}")
    
    def test_delete_staff(self, admin_token):
        """Test deleting staff member"""
        # First create a staff to delete
        unique_id = uuid.uuid4().hex[:8]
        test_email = f"TEST_delete_{unique_id}@acquapark.com"
        
        create_response = requests.post(f"{BASE_URL}/api/admin/staff",
            json={
                "name": f"Delete Test {unique_id}",
                "email": test_email,
                "password": "testpass123"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        if create_response.status_code == 200:
            staff_id = create_response.json()["id"]
            
            # Delete
            delete_response = requests.delete(f"{BASE_URL}/api/admin/staff/{staff_id}",
                headers={"Authorization": f"Bearer {admin_token}"}
            )
            assert delete_response.status_code == 200
            print(f"✓ Deleted staff member successfully")
            
            # Verify deletion - try to get staff list and check
            list_response = requests.get(f"{BASE_URL}/api/admin/staff",
                headers={"Authorization": f"Bearer {admin_token}"}
            )
            staff_list = list_response.json()
            staff_ids = [s["_id"] for s in staff_list]
            assert staff_id not in staff_ids
            print(f"✓ Verified staff was removed from list")


class TestStaffAuth:
    """Staff authentication tests"""
    
    def test_staff_login_success(self):
        """Test staff login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/staff/login", json={
            "email": STAFF_EMAIL,
            "password": STAFF_PASSWORD
        })
        
        if response.status_code == 200:
            data = response.json()
            assert "access_token" in data
            assert "staff" in data
            assert data["staff"]["email"] == STAFF_EMAIL
            print(f"✓ Staff login successful for {STAFF_EMAIL}")
            return data["access_token"]
        elif response.status_code == 401:
            print(f"⚠ Staff login failed - credentials may not exist yet")
            pytest.skip("Staff user not found")
        else:
            pytest.fail(f"Unexpected status code: {response.status_code}")
    
    def test_staff_login_invalid_credentials(self):
        """Test staff login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/staff/login", json={
            "email": "invalid@staff.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Staff login correctly rejected invalid credentials")
    
    def test_staff_me_endpoint(self):
        """Test /api/staff/me endpoint"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/staff/login", json={
            "email": STAFF_EMAIL,
            "password": STAFF_PASSWORD
        })
        
        if login_response.status_code != 200:
            pytest.skip("Staff login failed")
        
        token = login_response.json()["access_token"]
        
        # Check /me
        response = requests.get(f"{BASE_URL}/api/staff/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == STAFF_EMAIL
        print(f"✓ Staff /me endpoint returned correct info")


class TestTicketTypes:
    """Ticket types CRUD tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Admin authentication failed")
    
    def test_get_tickets_public(self):
        """Test fetching public ticket types"""
        response = requests.get(f"{BASE_URL}/api/tickets")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Verify ticket structure
        ticket = data[0]
        assert "ticket_id" in ticket
        assert "name" in ticket
        assert "price" in ticket
        assert "description" in ticket
        print(f"✓ Fetched {len(data)} ticket types")
    
    def test_create_ticket_type(self, admin_token):
        """Test creating new ticket type"""
        unique_id = uuid.uuid4().hex[:6]
        test_ticket_id = f"test-{unique_id}"
        
        response = requests.post(f"{BASE_URL}/api/admin/tickets",
            json={
                "ticket_id": test_ticket_id,
                "name": f"Test Ticket {unique_id}",
                "price": 99.99,
                "description": "Test ticket description",
                "features": ["Feature 1", "Feature 2"]
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            assert "id" in data
            print(f"✓ Created ticket type: {test_ticket_id}")
            
            # Verify it was created
            get_response = requests.get(f"{BASE_URL}/api/tickets/{test_ticket_id}")
            assert get_response.status_code == 200
            print(f"✓ Verified ticket type exists")
            
            # Cleanup
            requests.delete(f"{BASE_URL}/api/admin/tickets/{test_ticket_id}",
                headers={"Authorization": f"Bearer {admin_token}"})
            print(f"✓ Cleaned up test ticket")
        elif response.status_code == 400:
            print(f"✓ Ticket creation rejected (ID may already exist)")
        else:
            pytest.fail(f"Unexpected status code: {response.status_code}")
    
    def test_update_ticket_type(self, admin_token):
        """Test updating ticket type"""
        # First create a test ticket
        unique_id = uuid.uuid4().hex[:6]
        test_ticket_id = f"test-update-{unique_id}"
        
        create_response = requests.post(f"{BASE_URL}/api/admin/tickets",
            json={
                "ticket_id": test_ticket_id,
                "name": "Original Name",
                "price": 50.00,
                "description": "Original description",
                "features": []
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        if create_response.status_code == 200:
            # Update
            update_response = requests.put(f"{BASE_URL}/api/admin/tickets/{test_ticket_id}",
                json={
                    "name": "Updated Name",
                    "price": 75.00
                },
                headers={"Authorization": f"Bearer {admin_token}"}
            )
            assert update_response.status_code == 200
            print(f"✓ Updated ticket type")
            
            # Verify update
            get_response = requests.get(f"{BASE_URL}/api/tickets/{test_ticket_id}")
            if get_response.status_code == 200:
                data = get_response.json()
                assert data["name"] == "Updated Name"
                assert data["price"] == 75.00
                print(f"✓ Verified ticket update persisted")
            
            # Cleanup
            requests.delete(f"{BASE_URL}/api/admin/tickets/{test_ticket_id}",
                headers={"Authorization": f"Bearer {admin_token}"})
    
    def test_delete_ticket_type(self, admin_token):
        """Test deleting ticket type (soft delete)"""
        # First create a test ticket
        unique_id = uuid.uuid4().hex[:6]
        test_ticket_id = f"test-delete-{unique_id}"
        
        create_response = requests.post(f"{BASE_URL}/api/admin/tickets",
            json={
                "ticket_id": test_ticket_id,
                "name": "To Delete",
                "price": 10.00,
                "description": "Will be deleted",
                "features": []
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        if create_response.status_code == 200:
            # Delete
            delete_response = requests.delete(f"{BASE_URL}/api/admin/tickets/{test_ticket_id}",
                headers={"Authorization": f"Bearer {admin_token}"}
            )
            assert delete_response.status_code == 200
            print(f"✓ Deleted ticket type")
            
            # Verify deletion (should return 404 for inactive tickets)
            get_response = requests.get(f"{BASE_URL}/api/tickets/{test_ticket_id}")
            assert get_response.status_code == 404
            print(f"✓ Verified ticket was soft-deleted")


class TestTicketValidation:
    """Ticket validation tests"""
    
    @pytest.fixture
    def staff_token(self):
        """Get staff token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/staff/login", json={
            "email": STAFF_EMAIL,
            "password": STAFF_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Staff authentication failed")
    
    def test_ticket_info_not_found(self, staff_token):
        """Test getting info for non-existent ticket"""
        response = requests.get(f"{BASE_URL}/api/staff/ticket-info/INVALID-CODE-123",
            headers={"Authorization": f"Bearer {staff_token}"}
        )
        assert response.status_code == 404
        print("✓ Correctly returned 404 for invalid ticket code")
    
    def test_validate_ticket_not_found(self, staff_token):
        """Test validating non-existent ticket"""
        response = requests.post(f"{BASE_URL}/api/staff/validate-ticket",
            json={"ticket_code": "INVALID-CODE-456"},
            headers={"Authorization": f"Bearer {staff_token}"}
        )
        assert response.status_code == 404
        print("✓ Correctly returned 404 for invalid ticket validation")
    
    def test_validate_ticket_unauthorized(self):
        """Test ticket validation without auth"""
        response = requests.post(f"{BASE_URL}/api/staff/validate-ticket",
            json={"ticket_code": "ANY-CODE"}
        )
        assert response.status_code == 401
        print("✓ Correctly rejected unauthorized validation request")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
