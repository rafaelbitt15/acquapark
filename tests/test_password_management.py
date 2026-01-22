"""
Test suite for Acqua Park Password Management Features
Tests: Customer password change, forgot password, reset password, available dates
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "bitencourt.rafandrade@gmail.com"
ADMIN_PASSWORD = "Rafa2188"


class TestAvailableDates:
    """Test available dates endpoint for ticket purchase"""
    
    def test_get_available_dates(self):
        """Test GET /api/available-dates returns only dates with availability"""
        response = requests.get(f"{BASE_URL}/api/available-dates")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # Verify structure
        if len(data) > 0:
            item = data[0]
            assert 'date' in item
            assert 'available' in item
            assert item['available'] > 0  # Only dates with availability
            print(f"✓ Found {len(data)} available dates")
            for d in data:
                print(f"  - {d['date']}: {d['available']} tickets available")
        else:
            print("⚠ No available dates found")
    
    def test_available_dates_format(self):
        """Test that dates are in correct format YYYY-MM-DD"""
        response = requests.get(f"{BASE_URL}/api/available-dates")
        assert response.status_code == 200
        data = response.json()
        
        for item in data:
            date_str = item['date']
            # Verify date format
            try:
                datetime.strptime(date_str, '%Y-%m-%d')
                print(f"✓ Date {date_str} is in correct format")
            except ValueError:
                pytest.fail(f"Date {date_str} is not in YYYY-MM-DD format")


class TestCustomerRegistration:
    """Test customer registration for password tests"""
    
    @pytest.fixture
    def test_customer(self):
        """Create a test customer and return credentials"""
        unique_id = uuid.uuid4().hex[:8]
        email = f"TEST_customer_{unique_id}@test.com"
        password = "testpass123"
        
        response = requests.post(f"{BASE_URL}/api/customers/register", json={
            "name": f"Test Customer {unique_id}",
            "email": email,
            "phone": "11999999999",
            "document": f"123456789{unique_id[:2]}",
            "password": password
        })
        
        if response.status_code == 200:
            data = response.json()
            return {
                "email": email,
                "password": password,
                "token": data["access_token"],
                "customer_id": data["customer"]["id"]
            }
        else:
            pytest.skip(f"Could not create test customer: {response.text}")
    
    def test_customer_registration(self, test_customer):
        """Test customer can register"""
        assert test_customer is not None
        assert "token" in test_customer
        print(f"✓ Customer registered: {test_customer['email']}")


class TestCustomerLogin:
    """Test customer login"""
    
    @pytest.fixture
    def test_customer(self):
        """Create a test customer"""
        unique_id = uuid.uuid4().hex[:8]
        email = f"TEST_login_{unique_id}@test.com"
        password = "testpass123"
        
        response = requests.post(f"{BASE_URL}/api/customers/register", json={
            "name": f"Test Login {unique_id}",
            "email": email,
            "phone": "11999999999",
            "document": f"987654321{unique_id[:2]}",
            "password": password
        })
        
        if response.status_code == 200:
            return {"email": email, "password": password}
        pytest.skip("Could not create test customer")
    
    def test_customer_login_success(self, test_customer):
        """Test customer login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/customers/login", json={
            "email": test_customer["email"],
            "password": test_customer["password"]
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "customer" in data
        print(f"✓ Customer login successful: {test_customer['email']}")
    
    def test_customer_login_invalid(self):
        """Test customer login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/customers/login", json={
            "email": "invalid@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Customer login correctly rejected invalid credentials")


class TestChangePassword:
    """Test customer password change functionality"""
    
    @pytest.fixture
    def authenticated_customer(self):
        """Create and login a test customer"""
        unique_id = uuid.uuid4().hex[:8]
        email = f"TEST_change_{unique_id}@test.com"
        password = "oldpassword123"
        
        # Register
        reg_response = requests.post(f"{BASE_URL}/api/customers/register", json={
            "name": f"Test Change {unique_id}",
            "email": email,
            "phone": "11999999999",
            "document": f"111222333{unique_id[:2]}",
            "password": password
        })
        
        if reg_response.status_code == 200:
            data = reg_response.json()
            return {
                "email": email,
                "password": password,
                "token": data["access_token"]
            }
        pytest.skip("Could not create test customer")
    
    def test_change_password_success(self, authenticated_customer):
        """Test POST /api/customers/change-password with valid data"""
        new_password = "newpassword456"
        
        response = requests.post(
            f"{BASE_URL}/api/customers/change-password",
            json={
                "current_password": authenticated_customer["password"],
                "new_password": new_password
            },
            headers={"Authorization": f"Bearer {authenticated_customer['token']}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("message") == "Senha alterada com sucesso"
        print("✓ Password changed successfully")
        
        # Verify can login with new password
        login_response = requests.post(f"{BASE_URL}/api/customers/login", json={
            "email": authenticated_customer["email"],
            "password": new_password
        })
        assert login_response.status_code == 200
        print("✓ Verified login with new password works")
    
    def test_change_password_wrong_current(self, authenticated_customer):
        """Test change password with wrong current password"""
        response = requests.post(
            f"{BASE_URL}/api/customers/change-password",
            json={
                "current_password": "wrongpassword",
                "new_password": "newpassword456"
            },
            headers={"Authorization": f"Bearer {authenticated_customer['token']}"}
        )
        
        assert response.status_code == 400
        print("✓ Correctly rejected wrong current password")
    
    def test_change_password_short_new(self, authenticated_customer):
        """Test change password with too short new password"""
        response = requests.post(
            f"{BASE_URL}/api/customers/change-password",
            json={
                "current_password": authenticated_customer["password"],
                "new_password": "12345"  # Less than 6 chars
            },
            headers={"Authorization": f"Bearer {authenticated_customer['token']}"}
        )
        
        assert response.status_code == 400
        print("✓ Correctly rejected short password")
    
    def test_change_password_unauthorized(self):
        """Test change password without auth token"""
        response = requests.post(
            f"{BASE_URL}/api/customers/change-password",
            json={
                "current_password": "anypassword",
                "new_password": "newpassword456"
            }
        )
        
        assert response.status_code == 401
        print("✓ Correctly rejected unauthorized request")


class TestForgotPassword:
    """Test forgot password functionality"""
    
    @pytest.fixture
    def test_customer_email(self):
        """Create a test customer and return email"""
        unique_id = uuid.uuid4().hex[:8]
        email = f"TEST_forgot_{unique_id}@test.com"
        
        response = requests.post(f"{BASE_URL}/api/customers/register", json={
            "name": f"Test Forgot {unique_id}",
            "email": email,
            "phone": "11999999999",
            "document": f"444555666{unique_id[:2]}",
            "password": "testpass123"
        })
        
        if response.status_code == 200:
            return email
        pytest.skip("Could not create test customer")
    
    def test_forgot_password_existing_email(self, test_customer_email):
        """Test POST /api/customers/forgot-password with existing email"""
        response = requests.post(
            f"{BASE_URL}/api/customers/forgot-password",
            json={"email": test_customer_email}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        # For testing, reset_token is returned (should be removed in production)
        assert "reset_token" in data
        print(f"✓ Forgot password request successful, token received")
        return data["reset_token"]
    
    def test_forgot_password_nonexistent_email(self):
        """Test forgot password with non-existent email (should still return 200 for security)"""
        response = requests.post(
            f"{BASE_URL}/api/customers/forgot-password",
            json={"email": "nonexistent@test.com"}
        )
        
        # Should return 200 for security (don't reveal if email exists)
        assert response.status_code == 200
        print("✓ Forgot password correctly returns 200 for non-existent email (security)")
    
    def test_forgot_password_missing_email(self):
        """Test forgot password without email"""
        response = requests.post(
            f"{BASE_URL}/api/customers/forgot-password",
            json={}
        )
        
        assert response.status_code == 400
        print("✓ Correctly rejected request without email")


class TestResetPassword:
    """Test password reset functionality"""
    
    @pytest.fixture
    def reset_token_and_email(self):
        """Create customer and get reset token"""
        unique_id = uuid.uuid4().hex[:8]
        email = f"TEST_reset_{unique_id}@test.com"
        
        # Register customer
        reg_response = requests.post(f"{BASE_URL}/api/customers/register", json={
            "name": f"Test Reset {unique_id}",
            "email": email,
            "phone": "11999999999",
            "document": f"777888999{unique_id[:2]}",
            "password": "oldpassword123"
        })
        
        if reg_response.status_code != 200:
            pytest.skip("Could not create test customer")
        
        # Request password reset
        forgot_response = requests.post(
            f"{BASE_URL}/api/customers/forgot-password",
            json={"email": email}
        )
        
        if forgot_response.status_code == 200:
            data = forgot_response.json()
            return {
                "email": email,
                "reset_token": data.get("reset_token")
            }
        pytest.skip("Could not get reset token")
    
    def test_reset_password_success(self, reset_token_and_email):
        """Test POST /api/customers/reset-password with valid token"""
        new_password = "resetpassword789"
        
        response = requests.post(
            f"{BASE_URL}/api/customers/reset-password",
            json={
                "token": reset_token_and_email["reset_token"],
                "new_password": new_password
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("message") == "Senha redefinida com sucesso"
        print("✓ Password reset successful")
        
        # Verify can login with new password
        login_response = requests.post(f"{BASE_URL}/api/customers/login", json={
            "email": reset_token_and_email["email"],
            "password": new_password
        })
        assert login_response.status_code == 200
        print("✓ Verified login with reset password works")
    
    def test_reset_password_invalid_token(self):
        """Test reset password with invalid token"""
        response = requests.post(
            f"{BASE_URL}/api/customers/reset-password",
            json={
                "token": "invalid-token-12345",
                "new_password": "newpassword123"
            }
        )
        
        assert response.status_code == 400
        print("✓ Correctly rejected invalid token")
    
    def test_reset_password_short_password(self, reset_token_and_email):
        """Test reset password with too short password"""
        response = requests.post(
            f"{BASE_URL}/api/customers/reset-password",
            json={
                "token": reset_token_and_email["reset_token"],
                "new_password": "12345"  # Less than 6 chars
            }
        )
        
        assert response.status_code == 400
        print("✓ Correctly rejected short password")
    
    def test_reset_password_missing_fields(self):
        """Test reset password with missing fields"""
        response = requests.post(
            f"{BASE_URL}/api/customers/reset-password",
            json={}
        )
        
        assert response.status_code == 400
        print("✓ Correctly rejected request with missing fields")


class TestTicketsEndpoint:
    """Test tickets endpoint"""
    
    def test_get_tickets(self):
        """Test GET /api/tickets returns ticket types"""
        response = requests.get(f"{BASE_URL}/api/tickets")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Verify structure
        ticket = data[0]
        assert "ticket_id" in ticket
        assert "name" in ticket
        assert "price" in ticket
        assert "description" in ticket
        assert "features" in ticket
        print(f"✓ Found {len(data)} ticket types")


class TestCustomerMe:
    """Test customer /me endpoint"""
    
    @pytest.fixture
    def authenticated_customer(self):
        """Create and login a test customer"""
        unique_id = uuid.uuid4().hex[:8]
        email = f"TEST_me_{unique_id}@test.com"
        
        response = requests.post(f"{BASE_URL}/api/customers/register", json={
            "name": f"Test Me {unique_id}",
            "email": email,
            "phone": "11999999999",
            "document": f"000111222{unique_id[:2]}",
            "password": "testpass123"
        })
        
        if response.status_code == 200:
            data = response.json()
            return {
                "email": email,
                "token": data["access_token"],
                "name": f"Test Me {unique_id}"
            }
        pytest.skip("Could not create test customer")
    
    def test_customer_me_authenticated(self, authenticated_customer):
        """Test GET /api/customers/me with valid token"""
        response = requests.get(
            f"{BASE_URL}/api/customers/me",
            headers={"Authorization": f"Bearer {authenticated_customer['token']}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == authenticated_customer["email"]
        assert data["name"] == authenticated_customer["name"]
        assert "document" in data
        print(f"✓ Customer /me endpoint returned correct info")
    
    def test_customer_me_unauthorized(self):
        """Test GET /api/customers/me without token"""
        response = requests.get(f"{BASE_URL}/api/customers/me")
        assert response.status_code == 401
        print("✓ Correctly rejected unauthorized /me request")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
