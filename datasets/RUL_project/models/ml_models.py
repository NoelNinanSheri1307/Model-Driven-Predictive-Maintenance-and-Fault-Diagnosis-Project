from xgboost import XGBRegressor

def build_xgboost(depth=10, alpha=1.0, lbd=8.0, colsample=0.8, subsample=0.8, child_weight=25, lr=0.008):
    """
    Standardized XGBoost builder.
    High Child Weight (25) and Low Learning Rate (0.008) secured the 13.28 RMSE.
    """
    return XGBRegressor(
        n_estimators=4000,       
        max_depth=depth,         
        learning_rate=lr,     
        subsample=subsample,           
        colsample_bytree=colsample,    
        min_child_weight=child_weight,  
        reg_alpha=alpha,          
        reg_lambda=lbd,           
        early_stopping_rounds=100, 
        random_state=42, 
        n_jobs=-1
    )