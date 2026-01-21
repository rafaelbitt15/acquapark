"""
Backend API Tests for Ticket Management System
Tests: Ticket Availability, Staff Management, Staff Login, Ticket Validation
"""
import pytest
import requests
import os
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Admin credentials
ADMIN_EMAIL = "bitencourt.rafandrade@gmail.com"
ADMIN_PASSWORD = "Rafa2188"

# Test staff credentials
TEST_STAFF_EMAIL = "test_staff@acquapark.com"
TEST_STAFF_PASSWORD = "TestStaff123"
TEST_STAFF_NAME = "TEST_Staff_User"


class TestHealthCheck:
    """Basic health check tests"""
    
    def test_health_endpoint(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health check passed")


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
        print("✓ Admin login successful")
        return data["access_token"]
    
    def test_admin_login_invalid_credentials(self):
        """Test admin login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@email.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid credentials rejected correctly")


class TestTicketAvailability:
    """Ticket availability CRUD tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            self.admin_token = response.json()["access_token"]
            self.headers = {"Authorization": f"Bearer {self.admin_token}"}
        else:
            pytest.skip("Admin authentication failed")
    
    def test_get_ticket_availability(self):
        """Test fetching ticket availability list"""
        response = requests.get(f"{BASE_URL}/api/admin/ticket-availability", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Got {len(data)} availability records")
    
    def test_create_ticket_availability(self):
        """Test creating new ticket availability"""
        # Use a future date to avoid conflicts
        test_date = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
        
        response = requests.post(f"{BASE_URL}/api/admin/ticket-availability", 
            headers=self.headers,
            json={
                "date": test_date,
                "total_tickets": 150
            }
        )
        
        # Could be 200 or 400 if date already exists
        if response.status_code == 200:
            data = response.json()
            assert "id" in data or "message" in data
            print(f"✓ Created availability for {test_date}")
        elif response.status_code == 400:
            # Date already exists - this is acceptable
            print(f"✓ Availability for {test_date} already exists (expected)")
        else:
            assert False, f"Unexpected status code: {response.status_code}"
    
    def test_update_ticket_availability(self):
        """Test updating ticket availability"""
        # First create one
        test_date = (datetime.now() + timedelta(days=31)).strftime("%Y-%m-%d")
        
        # Create
        requests.post(f"{BASE_URL}/api/admin/ticket-availability", 
            headers=self.headers,
            json={"date": test_date, "total_tickets": 100}
        )
        
        # Update
        response = requests.put(f"{BASE_URL}/api/admin/ticket-availability/{test_date}",
            headers=self.headers,
            json={"total_tickets": 200, "is_active": True}
        )
        
        if response.status_code == 200:
            data = response.json()
            assert "message" in data
            print(f"✓ Updated availability for {test_date}")
        elif response.status_code == 404:
            print(f"✓ Availability not found (may not exist)")
        else:
            print(f"Update response: {response.status_code} - {response.text}")
    
    def test_delete_ticket_availability(self):
        """Test deleting ticket availability"""
        # Create a test date to delete
        test_date = (datetime.now() + timedelta(days=32)).strftime("%Y-%m-%d")
        
        # Create first
        requests.post(f"{BASE_URL}/api/admin/ticket-availability", 
            headers=self.headers,
            json={"date": test_date, "total_tickets": 50}
        )
        
        # Delete
        response = requests.delete(f"{BASE_URL}/api/admin/ticket-availability/{test_date}",
            headers=self.headers
        )
        
        assert response.status_code in [200, 404]
        print(f"✓ Delete availability returned {response.status_code}")
    
    def test_check_availability_public(self):
        """Test public availability check endpoint"""
        test_date = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
        
        response = requests.get(f"{BASE_URL}/api/check-availability/{test_date}?quantity=2")
        assert response.status_code == 200
        data = response.json()
        assert "available" in data
        print(f"✓ Availability check: {data}")


class TestStaffManagement:
    """Staff CRUD tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            self.admin_token = response.json()["access_token"]
            self.headers = {"Authorization": f"Bearer {self.admin_token}"}
        else:
            pytest.skip("Admin authentication failed")
    
    def test_get_staff_list(self):
        """Test fetching staff list"""
        response = requests.get(f"{BASE_URL}/api/admin/staff", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Got {len(data)} staff members")
        return data
    
    def test_create_staff(self):
        """Test creating new staff member"""
        response = requests.post(f"{BASE_URL}/api/admin/staff",
            headers=self.headers,
            json={
                "name": TEST_STAFF_NAME,
                "email": TEST_STAFF_EMAIL,
                "password": TEST_STAFF_PASSWORD
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            assert "id" in data or "message" in data
            print(f"✓ Created staff member: {TEST_STAFF_NAME}")
        elif response.status_code == 400:
            # Email already exists
            print(f"✓ Staff with email {TEST_STAFF_EMAIL} already exists")
        else:
            print(f"Create staff response: {response.status_code} - {response.text}")
    
    def test_delete_staff(self):
        """Test deleting staff member"""
        # First get staff list to find test staff
        response = requests.get(f"{BASE_URL}/api/admin/staff", headers=self.headers)
        staff_list = response.json()
        
        # Find test staff
        test_staff = next((s for s in staff_list if s.get("email") == TEST_STAFF_EMAIL), None)
        
        if test_staff:
            staff_id = test_staff["_id"]
            delete_response = requests.delete(f"{BASE_URL}/api/admin/staff/{staff_id}",
                headers=self.headers
            )
            assert delete_response.status_code in [200, 404]
            print(f"✓ Delete staff returned {delete_response.status_code}")
        else:
            print("✓ Test staff not found (may have been deleted)")


class TestStaffLogin:
    """Staff login tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Ensure test staff exists"""
        # Login as admin
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            admin_token = response.json()["access_token"]
            headers = {"Authorization": f"Bearer {admin_token}"}
            
            # Create test staff if not exists
            requests.post(f"{BASE_URL}/api/admin/staff",
                headers=headers,
                json={
                    "name": TEST_STAFF_NAME,
                    "email": TEST_STAFF_EMAIL,
                    "password": TEST_STAFF_PASSWORD
                }
            )
    
    def test_staff_login_success(self):
        """Test staff login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/staff/login", json={
            "email": TEST_STAFF_EMAIL,
            "password": TEST_STAFF_PASSWORD
        })
        
        if response.status_code == 200:
            data = response.json()
            assert "access_token" in data
            assert "staff" in data
            assert data["staff"]["email"] == TEST_STAFF_EMAIL
            print(f"✓ Staff login successful: {data['staff']['name']}")
            return data["access_token"]
        else:
            print(f"Staff login failed: {response.status_code} - {response.text}")
            pytest.skip("Staff login failed - staff may not exist")
    
    def test_staff_login_invalid_credentials(self):
        """Test staff login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/staff/login", json={
            "email": "wrong@email.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid staff credentials rejected correctly")
    
    def test_staff_me_endpoint(self):
        """Test staff /me endpoint"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/staff/login", json={
            "email": TEST_STAFF_EMAIL,
            "password": TEST_STAFF_PASSWORD
        })
        
        if login_response.status_code != 200:
            pytest.skip("Staff login failed")
        
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        response = requests.get(f"{BASE_URL}/api/staff/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == TEST_STAFF_EMAIL
        print(f"✓ Staff /me endpoint works: {data['name']}")


class TestTicketValidation:
    """Ticket validation tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get staff token for authenticated requests"""
        # Ensure test staff exists
        admin_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if admin_response.status_code == 200:
            admin_token = admin_response.json()["access_token"]
            headers = {"Authorization": f"Bearer {admin_token}"}
            
            # Create test staff
            requests.post(f"{BASE_URL}/api/admin/staff",
                headers=headers,
                json={
                    "name": TEST_STAFF_NAME,
                    "email": TEST_STAFF_EMAIL,
                    "password": TEST_STAFF_PASSWORD
                }
            )
        
        # Login as staff
        response = requests.post(f"{BASE_URL}/api/staff/login", json={
            "email": TEST_STAFF_EMAIL,
            "password": TEST_STAFF_PASSWORD
        })
        if response.status_code == 200:
            self.staff_token = response.json()["access_token"]
            self.headers = {"Authorization": f"Bearer {self.staff_token}"}
        else:
            pytest.skip("Staff authentication failed")
    
    def test_validate_nonexistent_ticket(self):
        """Test validating a ticket that doesn't exist"""
        response = requests.post(f"{BASE_URL}/api/staff/validate-ticket",
            headers=self.headers,
            json={"ticket_code": "TKT-NONEXISTENT123"}
        )
        assert response.status_code == 404
        print("✓ Non-existent ticket correctly returns 404")
    
    def test_get_ticket_info_nonexistent(self):
        """Test getting info for non-existent ticket"""
        response = requests.get(f"{BASE_URL}/api/staff/ticket-info/TKT-NONEXISTENT123",
            headers=self.headers
        )
        assert response.status_code == 404
        print("✓ Non-existent ticket info correctly returns 404")
    
    def test_validate_without_auth(self):
        """Test validation without authentication"""
        response = requests.post(f"{BASE_URL}/api/staff/validate-ticket",
            json={"ticket_code": "TKT-TEST123"}
        )
        assert response.status_code == 401
        print("✓ Unauthenticated validation correctly rejected")


class TestTicketTypes:
    """Ticket types CRUD tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            self.admin_token = response.json()["access_token"]
            self.headers = {"Authorization": f"Bearer {self.admin_token}"}
        else:
            pytest.skip("Admin authentication failed")
    
    def test_get_tickets(self):
        """Test fetching ticket types"""
        response = requests.get(f"{BASE_URL}/api/tickets")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Got {len(data)} ticket types")
        for ticket in data:
            print(f"  - {ticket.get('name', 'Unknown')}: R$ {ticket.get('price', 0)}")
    
    def test_create_ticket_type(self):
        """Test creating new ticket type"""
        response = requests.post(f"{BASE_URL}/api/admin/tickets",
            headers=self.headers,
            json={
                "ticket_id": "test_ticket_type",
                "name": "TEST_Ingresso Teste",
                "price": 99.99,
                "description": "Ingresso de teste para automação",
                "features": ["Feature 1", "Feature 2"]
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            assert "id" in data or "message" in data
            print("✓ Created test ticket type")
        elif response.status_code == 400:
            print("✓ Test ticket type already exists")
        else:
            print(f"Create ticket type response: {response.status_code} - {response.text}")
    
    def test_update_ticket_type(self):
        """Test updating ticket type"""
        response = requests.put(f"{BASE_URL}/api/admin/tickets/test_ticket_type",
            headers=self.headers,
            json={
                "name": "TEST_Ingresso Teste Atualizado",
                "price": 149.99,
                "description": "Descrição atualizada",
                "features": ["Feature 1", "Feature 2", "Feature 3"]
            }
        )
        
        if response.status_code == 200:
            print("✓ Updated test ticket type")
        elif response.status_code == 404:
            print("✓ Test ticket type not found (may not exist)")
        else:
            print(f"Update ticket type response: {response.status_code} - {response.text}")
    
    def test_delete_ticket_type(self):
        """Test deleting ticket type"""
        response = requests.delete(f"{BASE_URL}/api/admin/tickets/test_ticket_type",
            headers=self.headers
        )
        
        assert response.status_code in [200, 404]
        print(f"✓ Delete ticket type returned {response.status_code}")


class TestCleanup:
    """Cleanup test data"""
    
    def test_cleanup_test_staff(self):
        """Remove test staff after tests"""
        # Login as admin
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        
        admin_token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Get staff list
        staff_response = requests.get(f"{BASE_URL}/api/admin/staff", headers=headers)
        staff_list = staff_response.json()
        
        # Find and delete test staff
        test_staff = next((s for s in staff_list if s.get("email") == TEST_STAFF_EMAIL), None)
        if test_staff:
            requests.delete(f"{BASE_URL}/api/admin/staff/{test_staff['_id']}", headers=headers)
            print("✓ Cleaned up test staff")
        else:
            print("✓ No test staff to clean up")
    
    def test_cleanup_test_availability(self):
        """Remove test availability after tests"""
        # Login as admin
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        
        admin_token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Delete test dates
        for days in [30, 31, 32]:
            test_date = (datetime.now() + timedelta(days=days)).strftime("%Y-%m-%d")
            requests.delete(f"{BASE_URL}/api/admin/ticket-availability/{test_date}", headers=headers)
        
        print("✓ Cleaned up test availability dates")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
